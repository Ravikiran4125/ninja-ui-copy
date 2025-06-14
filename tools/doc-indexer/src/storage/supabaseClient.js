import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

class SupabaseClient {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }
  
  async storeChunks(chunks) {
    if (chunks.length === 0) {
      logger.debug('No chunks to store');
      return;
    }
    
    try {
      // Insert chunks into Supabase
      const { data, error } = await this.supabase
        .from('ninja_agents_documents')
        .upsert(
          chunks.map(chunk => ({
            content: chunk.content,
            embedding: chunk.embedding,
            type: chunk.type,
            symbol: chunk.symbol,
            metadata: chunk.metadata
          })),
          { onConflict: 'content' }
        );
      
      if (error) {
        logger.error('Error storing chunks in Supabase:', error);
        throw error;
      }
      
      logger.debug(`Successfully stored ${chunks.length} chunks in Supabase`);
    } catch (error) {
      logger.error('Error in storeChunks:', error);
      throw error;
    }
  }
  
  async createMatchDocumentsFunction() {
    try {
      // Create a stored procedure for matching documents
      const { error } = await this.supabase.rpc('create_match_documents_function');
      
      if (error) {
        logger.error('Error creating match_documents function:', error);
        throw error;
      }
      
      logger.info('Successfully created match_documents function in Supabase');
    } catch (error) {
      logger.error('Error in createMatchDocumentsFunction:', error);
      throw error;
    }
  }
  
  async setupDatabase() {
    try {
      // Enable pgvector extension
      const { error: extensionError } = await this.supabase.rpc('enable_pgvector_extension');
      
      if (extensionError) {
        logger.error('Error enabling pgvector extension:', extensionError);
        throw extensionError;
      }
      
      // Create the documents table
      const { error: tableError } = await this.supabase.rpc('create_documents_table');
      
      if (tableError) {
        logger.error('Error creating documents table:', tableError);
        throw tableError;
      }
      
      // Create the match_documents function
      await this.createMatchDocumentsFunction();
      
      logger.info('Successfully set up database for document indexing');
    } catch (error) {
      logger.error('Error in setupDatabase:', error);
      throw error;
    }
  }
}

export const supabaseClient = new SupabaseClient();