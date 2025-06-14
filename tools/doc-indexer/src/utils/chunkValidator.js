import { logger } from './logger.js';

class ChunkValidator {
  validate(chunk) {
    // Check for required fields
    const requiredFields = ['content', 'type', 'metadata'];
    const missingFields = requiredFields.filter(field => !chunk[field]);
    
    if (missingFields.length > 0) {
      logger.debug(`Chunk missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Check content length (minimum 30 tokens, roughly 120 characters)
    if (chunk.content.length < 120) {
      logger.debug(`Chunk content too short: ${chunk.content.length} chars`);
      return false;
    }
    
    // Validate type
    const validTypes = ['concept', 'code', 'doc', 'example'];
    if (!validTypes.includes(chunk.type)) {
      logger.debug(`Invalid chunk type: ${chunk.type}`);
      return false;
    }
    
    // Validate metadata
    if (!chunk.metadata.file) {
      logger.debug('Chunk metadata missing file path');
      return false;
    }
    
    return true;
  }
  
  estimateTokens(content) {
    // Simple token estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }
}

export const chunkValidator = new ChunkValidator();