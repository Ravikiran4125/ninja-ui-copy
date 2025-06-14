#!/usr/bin/env node
import 'dotenv/config';
import { fileCollector } from './src/utils/fileCollector.js';
import { markdownProcessor } from './src/processors/markdownProcessor.js';
import { typeScriptProcessor } from './src/processors/typeScriptProcessor.js';
import { typedocProcessor } from './src/processors/typedocProcessor.js';
import { openaiEmbedder } from './src/embedders/openaiEmbedder.js';
import { supabaseClient } from './src/storage/supabaseClient.js';
import { logger } from './src/utils/logger.js';
import { validateConfig } from './src/utils/configValidator.js';

// Validate configuration
validateConfig();

// Configuration
const config = {
  dryRun: process.env.DRY_RUN === 'true',
  embedAndStore: process.env.EMBED_AND_STORE === 'true',
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
  cacheEnabled: process.env.CACHE_ENABLED === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  paths: {
    legacyDocs: '../legacy-docs',
    packageDocs: '../packages/ninja-agents'
  }
};

// Main function
async function main() {
  logger.info('Starting Ninja Doc Indexer');
  logger.info(`Mode: ${config.dryRun ? 'DRY RUN' : 'FULL RUN'}`);
  logger.info(`Embed and Store: ${config.embedAndStore ? 'ENABLED' : 'DISABLED'}`);

  try {
    // Collect files
    logger.info('Collecting files...');
    const files = await fileCollector.collectFiles(config.paths);
    logger.info(`Found ${files.length} files to process`);

    // Process files and generate chunks
    logger.info('Processing files and generating chunks...');
    const chunks = [];

    for (const file of files) {
      logger.debug(`Processing file: ${file.path}`);
      
      let fileChunks = [];
      
      if (file.path.endsWith('.md')) {
        fileChunks = await markdownProcessor.process(file);
      } else if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
        fileChunks = await typeScriptProcessor.process(file);
      } else if (file.path.includes('typedoc.json')) {
        fileChunks = await typedocProcessor.process(file);
      } else {
        logger.debug(`Skipping unsupported file type: ${file.path}`);
        continue;
      }
      
      logger.debug(`Generated ${fileChunks.length} chunks from ${file.path}`);
      chunks.push(...fileChunks);
    }

    logger.info(`Generated ${chunks.length} total chunks`);

    // Generate embeddings and store in Supabase
    if (config.embedAndStore) {
      logger.info('Generating embeddings and storing in Supabase...');
      
      // Process in batches
      for (let i = 0; i < chunks.length; i += config.batchSize) {
        const batchChunks = chunks.slice(i, i + config.batchSize);
        logger.debug(`Processing batch ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(chunks.length / config.batchSize)}`);
        
        // Generate embeddings
        const chunksWithEmbeddings = await openaiEmbedder.embedChunks(batchChunks, config.dryRun);
        
        // Store in Supabase
        if (!config.dryRun) {
          await supabaseClient.storeChunks(chunksWithEmbeddings);
        }
        
        logger.debug(`Completed batch ${Math.floor(i / config.batchSize) + 1}`);
      }
    }

    // Print summary
    logger.info('Indexing complete!');
    logger.info(`Processed ${files.length} files`);
    logger.info(`Generated ${chunks.length} chunks`);
    
    if (config.dryRun) {
      const estimatedTokens = chunks.reduce((acc, chunk) => acc + Math.ceil(chunk.content.length / 4), 0);
      const estimatedCost = (estimatedTokens / 1000) * 0.00002; // $0.00002 per 1K tokens
      logger.info(`Estimated tokens: ${estimatedTokens.toLocaleString()}`);
      logger.info(`Estimated cost: $${estimatedCost.toFixed(4)}`);
    }
  } catch (error) {
    logger.error('Error in indexing process:', error);
    process.exit(1);
  }
}

// Run the main function
main();