import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';
import { chunkValidator } from '../utils/chunkValidator.js';

class OpenAIEmbedder {
  constructor() {
    this.openai = null;
    this.cacheEnabled = process.env.CACHE_ENABLED === 'true';
    this.cacheDir = path.join(process.cwd(), '.cache');
    this.cacheFile = path.join(this.cacheDir, 'embeddings-cache.json');
    this.cache = new Map();
  }
  
  init(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    try {
      this.openai = new OpenAI({ apiKey });
      logger.debug('OpenAI client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OpenAI client:', error);
      throw error;
    }
  }
  
  async initCache() {
    if (!this.cacheEnabled) return;
    
    try {
      // Create cache directory if it doesn't exist
      await fs.mkdir(this.cacheDir, { recursive: true });
      
      // Load cache from file if it exists
      try {
        const cacheData = await fs.readFile(this.cacheFile, 'utf-8');
        const cacheEntries = JSON.parse(cacheData);
        this.cache = new Map(cacheEntries);
        logger.debug(`Loaded ${this.cache.size} cached embeddings`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          logger.warn('Error loading embeddings cache:', error);
        }
        // Initialize empty cache if file doesn't exist or can't be read
        this.cache = new Map();
      }
    } catch (error) {
      logger.warn('Error initializing cache:', error);
      this.cache = new Map();
    }
  }
  
  async saveCache() {
    if (!this.cacheEnabled) return;
    
    try {
      const cacheEntries = Array.from(this.cache.entries());
      await fs.writeFile(this.cacheFile, JSON.stringify(cacheEntries), 'utf-8');
      logger.debug(`Saved ${this.cache.size} embeddings to cache`);
    } catch (error) {
      logger.warn('Error saving embeddings cache:', error);
    }
  }
  
  getCacheKey(content) {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  async embedChunks(chunks, dryRun = false) {
    if (!this.openai && !dryRun) {
      throw new Error('OpenAI client not initialized. Call init() first.');
    }
    
    // Initialize cache
    await this.initCache();
    
    const chunksWithEmbeddings = [];
    let totalTokens = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Validate chunk
      if (!chunkValidator.validate(chunk)) {
        logger.warn(`Skipping invalid chunk: ${chunk.metadata?.file || 'unknown'}`);
        continue;
      }
      
      // Estimate tokens
      const estimatedTokens = chunkValidator.estimateTokens(chunk.content);
      totalTokens += estimatedTokens;
      
      if (dryRun) {
        // In dry run mode, just add placeholder embedding
        chunksWithEmbeddings.push({
          ...chunk,
          embedding: []
        });
        logger.debug(`[DRY RUN] Processed chunk ${i + 1}/${chunks.length} (${estimatedTokens} tokens)`);
      } else {
        // Check cache first
        const cacheKey = this.getCacheKey(chunk.content);
        let embedding;
        
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
          embedding = this.cache.get(cacheKey);
          logger.debug(`Using cached embedding for chunk ${i + 1}/${chunks.length}`);
        } else {
          // Generate embedding
          try {
            const response = await this.openai.embeddings.create({
              model: 'text-embedding-3-small',
              input: chunk.content
            });
            
            embedding = response.data[0].embedding;
            
            // Cache the embedding
            if (this.cacheEnabled) {
              this.cache.set(cacheKey, embedding);
            }
            
            logger.debug(`Generated embedding for chunk ${i + 1}/${chunks.length} (${estimatedTokens} tokens)`);
          } catch (error) {
            logger.error(`Error generating embedding for chunk ${i + 1}/${chunks.length}:`, error);
            continue;
          }
        }
        
        chunksWithEmbeddings.push({
          ...chunk,
          embedding
        });
      }
    }
    
    // Save cache
    if (!dryRun && this.cacheEnabled) {
      await this.saveCache();
    }
    
    // Log token usage and cost
    const cost = (totalTokens / 1000) * 0.00002; // $0.00002 per 1K tokens
    logger.info(`Total tokens: ${totalTokens.toLocaleString()}`);
    logger.info(`Estimated cost: $${cost.toFixed(4)}`);
    
    return chunksWithEmbeddings;
  }
}

export const openaiEmbedder = new OpenAIEmbedder();