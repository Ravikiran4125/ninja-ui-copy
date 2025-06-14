import { logger } from '../utils/logger.js';
import { chunkValidator } from '../utils/chunkValidator.js';
import path from 'path';

class TypeScriptProcessor {
  async process(file) {
    logger.debug(`Processing TypeScript file: ${file.path}`);
    const chunks = [];
    
    try {
      const content = file.content;
      const lines = content.split('\n');
      
      // Find export statements and their surrounding context
      let currentExport = null;
      let currentExportStart = -1;
      let currentExportEnd = -1;
      let currentExportContent = [];
      let inComment = false;
      let commentStart = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Track JSDoc comments
        if (line.trim().startsWith('/**')) {
          inComment = true;
          commentStart = i;
        }
        
        if (inComment && line.trim().endsWith('*/')) {
          inComment = false;
        }
        
        // Detect export statements
        if (line.match(/^export\s+(class|interface|type|const|function|enum)\s+(\w+)/)) {
          // If we were already tracking an export, finalize it
          if (currentExport) {
            const chunk = this.createChunk(
              currentExport,
              currentExportContent.join('\n'),
              file,
              currentExportStart,
              currentExportEnd
            );
            
            if (chunkValidator.validate(chunk)) {
              chunks.push(chunk);
            }
          }
          
          // Start tracking new export
          const match = line.match(/^export\s+(class|interface|type|const|function|enum)\s+(\w+)/);
          currentExport = match[2];
          currentExportStart = commentStart !== -1 ? commentStart : i;
          currentExportContent = [];
          
          // Include preceding comment if it exists
          if (commentStart !== -1) {
            for (let j = commentStart; j <= i; j++) {
              currentExportContent.push(lines[j]);
            }
          } else {
            currentExportContent.push(line);
          }
        }
        // Continue collecting lines for current export
        else if (currentExport) {
          currentExportContent.push(line);
          
          // Check if this is the end of the export (empty line after a closing brace or semicolon)
          if (line.trim() === '' && 
              (lines[i-1]?.trim().endsWith('}') || lines[i-1]?.trim().endsWith(';'))) {
            currentExportEnd = i;
            
            const chunk = this.createChunk(
              currentExport,
              currentExportContent.join('\n'),
              file,
              currentExportStart,
              currentExportEnd
            );
            
            if (chunkValidator.validate(chunk)) {
              chunks.push(chunk);
            }
            
            currentExport = null;
            currentExportStart = -1;
            currentExportEnd = -1;
            currentExportContent = [];
          }
        }
      }
      
      // Process any remaining export
      if (currentExport) {
        const chunk = this.createChunk(
          currentExport,
          currentExportContent.join('\n'),
          file,
          currentExportStart,
          lines.length - 1
        );
        
        if (chunkValidator.validate(chunk)) {
          chunks.push(chunk);
        }
      }
      
      logger.debug(`Generated ${chunks.length} chunks from TypeScript file`);
      return chunks;
    } catch (error) {
      logger.error(`Error processing TypeScript file ${file.path}:`, error);
      return [];
    }
  }
  
  createChunk(symbolName, content, file, lineStart, lineEnd) {
    // Determine the symbol type based on content
    const symbol = this.detectSymbol(symbolName, content);
    
    return {
      content: content.trim(),
      type: 'code',
      symbol,
      metadata: {
        file: file.path,
        lineStart,
        lineEnd,
        lastUpdated: file.lastModified.toISOString()
      }
    };
  }
  
  detectSymbol(symbolName, content) {
    // Check if the symbol name matches any of the Ninja metaphors
    const symbolLower = symbolName.toLowerCase();
    
    if (symbolLower.includes('shinobi')) return 'Shinobi';
    if (symbolLower.includes('kata')) return 'Kata';
    if (symbolLower.includes('shuriken')) return 'Shuriken';
    if (symbolLower.includes('dojo')) return 'Dojo';
    if (symbolLower.includes('clan')) return 'Clan';
    
    // Check content for clues
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('shinobi')) return 'Shinobi';
    if (contentLower.includes('kata')) return 'Kata';
    if (contentLower.includes('shuriken')) return 'Shuriken';
    if (contentLower.includes('dojo')) return 'Dojo';
    if (contentLower.includes('clan')) return 'Clan';
    
    // Return the symbol name if no specific match
    return symbolName;
  }
}

export const typeScriptProcessor = new TypeScriptProcessor();