import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please ensure SUPABASE_URL, SUPABASE_KEY, and OPENAI_API_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: openaiApiKey
});

async function queryDocuments(query, options = {}) {
  const {
    limit = 5,
    threshold = 0.5,
    symbol = null,
    type = null
  } = options;

  console.log(`Querying for: "${query}"`);
  
  try {
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    
    const embedding = embeddingResponse.data[0].embedding;
    
    // Query the database
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit * 2 // Get more results for filtering
    });
    
    if (error) {
      console.error('Error querying documents:', error);
      return [];
    }
    
    // Filter by symbol and type if provided
    let filteredData = data;
    
    if (symbol) {
      filteredData = filteredData.filter(doc => doc.symbol === symbol);
    }
    
    if (type) {
      filteredData = filteredData.filter(doc => doc.type === type);
    }
    
    // Limit results
    filteredData = filteredData.slice(0, limit);
    
    console.log(`Found ${filteredData.length} matching documents`);
    
    return filteredData;
  } catch (error) {
    console.error('Error in queryDocuments:', error);
    return [];
  }
}

// Example usage
async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node query-documents.js "your query here"');
    process.exit(1);
  }
  
  const query = process.argv[2];
  const options = {
    limit: 5,
    threshold: 0.5
  };
  
  // Parse additional options
  for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    
    if (arg.startsWith('--symbol=')) {
      options.symbol = arg.split('=')[1];
    } else if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--threshold=')) {
      options.threshold = parseFloat(arg.split('=')[1]);
    }
  }
  
  const results = await queryDocuments(query, options);
  
  // Display results
  console.log('\nResults:');
  console.log('========\n');
  
  for (const [index, doc] of results.entries()) {
    console.log(`Result ${index + 1} (Similarity: ${(doc.similarity * 100).toFixed(1)}%)`);
    console.log(`Type: ${doc.type}, Symbol: ${doc.symbol || 'N/A'}`);
    console.log(`File: ${doc.metadata.file}`);
    if (doc.metadata.heading) {
      console.log(`Heading: ${doc.metadata.heading}`);
    }
    console.log('---');
    console.log(doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''));
    console.log('\n');
  }
}

main().catch(console.error);