import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

class FileCollector {
  async collectFiles({ legacyDocs, packageDocs }) {
    const files = [];

    try {
      // Collect markdown files from legacy-docs
      const mdFiles = await glob(`${legacyDocs}/**/*.md`);
      for (const filePath of mdFiles) {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        
        files.push({
          path: filePath,
          content,
          lastModified: stats.mtime,
          type: 'markdown'
        });
        
        logger.debug(`Collected markdown file: ${filePath}`);
      }

      // Collect TypeScript files from packages/ninja-agents
      const tsFiles = await glob(`${packageDocs}/**/*.ts`, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
      });
      
      for (const filePath of tsFiles) {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        
        files.push({
          path: filePath,
          content,
          lastModified: stats.mtime,
          type: 'typescript'
        });
        
        logger.debug(`Collected TypeScript file: ${filePath}`);
      }

      // Look for typedoc.json
      try {
        const typedocPath = path.join(packageDocs, 'docs/api.json');
        const typedocStats = await fs.stat(typedocPath);
        const typedocContent = await fs.readFile(typedocPath, 'utf-8');
        
        files.push({
          path: typedocPath,
          content: typedocContent,
          lastModified: typedocStats.mtime,
          type: 'typedoc'
        });
        
        logger.debug(`Collected TypeDoc file: ${typedocPath}`);
      } catch (error) {
        logger.warn(`TypeDoc file not found or couldn't be read: ${error.message}`);
      }

      logger.info(`Collected ${files.length} files in total`);
      return files;
    } catch (error) {
      logger.error('Error collecting files:', error);
      throw error;
    }
  }
}

export const fileCollector = new FileCollector();