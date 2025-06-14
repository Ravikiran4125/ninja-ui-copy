import { logger } from '../utils/logger.js';
import { chunkValidator } from '../utils/chunkValidator.js';

class TypedocProcessor {
  async process(file) {
    logger.debug(`Processing TypeDoc file: ${file.path}`);
    const chunks = [];
    
    try {
      // Parse the TypeDoc JSON
      const typedoc = JSON.parse(file.content);
      
      // Process each child in the TypeDoc
      if (typedoc.children) {
        for (const child of typedoc.children) {
          const childChunks = this.processChild(child, file);
          chunks.push(...childChunks);
        }
      }
      
      logger.debug(`Generated ${chunks.length} chunks from TypeDoc file`);
      return chunks;
    } catch (error) {
      logger.error(`Error processing TypeDoc file ${file.path}:`, error);
      return [];
    }
  }
  
  processChild(child, file, parentName = '') {
    const chunks = [];
    
    // Skip if no name or kind
    if (!child.name || !child.kindString) {
      return chunks;
    }
    
    // Create a chunk for this child
    const fullName = parentName ? `${parentName}.${child.name}` : child.name;
    const content = this.formatChildContent(child);
    
    if (content) {
      const chunk = {
        content,
        type: this.getTypeFromKind(child.kindString),
        symbol: this.detectSymbol(child.name, content),
        metadata: {
          file: file.path,
          heading: fullName,
          lastUpdated: file.lastModified.toISOString()
        }
      };
      
      if (chunkValidator.validate(chunk)) {
        chunks.push(chunk);
      }
    }
    
    // Process children recursively
    if (child.children) {
      for (const grandchild of child.children) {
        const grandchildChunks = this.processChild(grandchild, file, fullName);
        chunks.push(...grandchildChunks);
      }
    }
    
    return chunks;
  }
  
  formatChildContent(child) {
    let content = `# ${child.name}\n\n`;
    
    if (child.kindString) {
      content += `**Type:** ${child.kindString}\n\n`;
    }
    
    if (child.comment) {
      if (child.comment.shortText) {
        content += `${child.comment.shortText}\n\n`;
      }
      
      if (child.comment.text) {
        content += `${child.comment.text}\n\n`;
      }
      
      if (child.comment.tags) {
        for (const tag of child.comment.tags) {
          content += `**@${tag.tag}** ${tag.text}\n\n`;
        }
      }
    }
    
    // Add signature information for functions/methods
    if (child.signatures) {
      for (const signature of child.signatures) {
        if (signature.comment) {
          if (signature.comment.shortText) {
            content += `${signature.comment.shortText}\n\n`;
          }
          
          if (signature.comment.text) {
            content += `${signature.comment.text}\n\n`;
          }
          
          if (signature.comment.returns) {
            content += `**Returns:** ${signature.comment.returns}\n\n`;
          }
          
          if (signature.comment.tags) {
            for (const tag of signature.comment.tags) {
              content += `**@${tag.tag}** ${tag.text}\n\n`;
            }
          }
        }
        
        if (signature.parameters) {
          content += `**Parameters:**\n\n`;
          
          for (const param of signature.parameters) {
            content += `- \`${param.name}\``;
            
            if (param.type) {
              content += `: ${this.formatType(param.type)}`;
            }
            
            if (param.comment && param.comment.text) {
              content += ` - ${param.comment.text}`;
            }
            
            content += `\n`;
          }
          
          content += `\n`;
        }
      }
    }
    
    return content.trim();
  }
  
  formatType(type) {
    if (type.type === 'intrinsic' || type.type === 'reference') {
      return type.name;
    } else if (type.type === 'union') {
      return type.types.map(t => this.formatType(t)).join(' | ');
    } else if (type.type === 'array') {
      return `${this.formatType(type.elementType)}[]`;
    } else {
      return 'any';
    }
  }
  
  getTypeFromKind(kindString) {
    const kindLower = kindString.toLowerCase();
    
    if (kindLower.includes('class') || kindLower.includes('interface')) {
      return 'code';
    } else if (kindLower.includes('function') || kindLower.includes('method')) {
      return 'code';
    } else if (kindLower.includes('type') || kindLower.includes('enum')) {
      return 'code';
    } else if (kindLower.includes('property') || kindLower.includes('accessor')) {
      return 'code';
    } else if (kindLower.includes('example')) {
      return 'example';
    } else {
      return 'doc';
    }
  }
  
  detectSymbol(name, content) {
    const nameLower = name.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Check name first
    if (nameLower.includes('shinobi')) return 'Shinobi';
    if (nameLower.includes('kata')) return 'Kata';
    if (nameLower.includes('shuriken')) return 'Shuriken';
    if (nameLower.includes('dojo')) return 'Dojo';
    if (nameLower.includes('clan')) return 'Clan';
    
    // Then check content
    if (contentLower.includes('shinobi')) return 'Shinobi';
    if (contentLower.includes('kata')) return 'Kata';
    if (contentLower.includes('shuriken')) return 'Shuriken';
    if (contentLower.includes('dojo')) return 'Dojo';
    if (contentLower.includes('clan')) return 'Clan';
    
    // Return the name if no specific match
    return name;
  }
}

export const typedocProcessor = new TypedocProcessor();