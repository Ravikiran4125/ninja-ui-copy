import { logger } from '../utils/logger.js';
import { chunkValidator } from '../utils/chunkValidator.js';
import path from 'path';

class MarkdownProcessor {
  async process(file) {
    logger.debug(`Processing markdown file: ${file.path}`);
    const chunks = [];
    
    try {
      const content = file.content;
      const fileName = path.basename(file.path);
      
      // Split by headings (## or ###)
      const headingSplits = content.split(/^(#{2,3} .+)$/gm);
      
      let currentHeading = fileName.replace('.md', '');
      let currentContent = '';
      
      for (const split of headingSplits) {
        if (split.startsWith('## ') || split.startsWith('### ')) {
          // Process previous chunk if it exists
          if (currentContent.trim().length > 0) {
            const chunk = this.createChunk(currentHeading, currentContent, file);
            if (chunkValidator.validate(chunk)) {
              chunks.push(chunk);
            }
          }
          
          // Update current heading
          currentHeading = split.replace(/^#{2,3} /, '').trim();
          currentContent = '';
        } else {
          // Append to current content
          currentContent += split;
        }
      }
      
      // Process the last chunk
      if (currentContent.trim().length > 0) {
        const chunk = this.createChunk(currentHeading, currentContent, file);
        if (chunkValidator.validate(chunk)) {
          chunks.push(chunk);
        }
      }
      
      logger.debug(`Generated ${chunks.length} chunks from markdown file`);
      return chunks;
    } catch (error) {
      logger.error(`Error processing markdown file ${file.path}:`, error);
      return [];
    }
  }
  
  createChunk(heading, content, file) {
    // Determine the symbol based on content and heading
    const symbol = this.detectSymbol(heading, content);
    
    // Determine the type based on content
    const type = this.detectType(heading, content);
    
    return {
      content: `${heading}\n\n${content.trim()}`,
      type,
      symbol,
      metadata: {
        file: file.path,
        heading,
        lastUpdated: file.lastModified.toISOString()
      }
    };
  }
  
  detectSymbol(heading, content) {
    const headingLower = heading.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Check for Ninja metaphors in heading first
    if (headingLower.includes('shinobi')) return 'Shinobi';
    if (headingLower.includes('kata')) return 'Kata';
    if (headingLower.includes('shuriken')) return 'Shuriken';
    if (headingLower.includes('dojo')) return 'Dojo';
    if (headingLower.includes('clan')) return 'Clan';
    
    // Then check content
    if (contentLower.includes('shinobi')) return 'Shinobi';
    if (contentLower.includes('kata')) return 'Kata';
    if (contentLower.includes('shuriken')) return 'Shuriken';
    if (contentLower.includes('dojo')) return 'Dojo';
    if (contentLower.includes('clan')) return 'Clan';
    
    // Default to null if no symbol detected
    return null;
  }
  
  detectType(heading, content) {
    const headingLower = heading.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Check for examples
    if (headingLower.includes('example') || 
        contentLower.includes('```typescript') || 
        contentLower.includes('```javascript')) {
      return 'example';
    }
    
    // Check for concepts
    if (headingLower.includes('concept') || 
        headingLower.includes('overview') || 
        headingLower.includes('introduction')) {
      return 'concept';
    }
    
    // Default to doc
    return 'doc';
  }
}

export const markdownProcessor = new MarkdownProcessor();