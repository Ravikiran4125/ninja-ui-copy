import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function retrieveRelevantDocuments(query, options = {}) {
  const {
    limit = 5,
    threshold = 0.5,
    symbol = null,
    type = null
  } = options;
  
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
    
    return filteredData;
  } catch (error) {
    console.error('Error in retrieveRelevantDocuments:', error);
    return [];
  }
}

async function generateResponse(query, documents) {
  try {
    // Format documents as context
    const context = documents.map((doc, index) => {
      return `Document ${index + 1} [${doc.type}${doc.symbol ? `, ${doc.symbol}` : ''}]:
${doc.content}

`;
    }).join('\n');
    
    // Generate response using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant specialized in the Ninja Agents SDK. 
Answer questions based on the provided documentation context.
If the context doesn't contain relevant information, say so clearly.
Focus on being accurate and helpful.`
        },
        {
          role: 'user',
          content: `Context information from Ninja Agents SDK documentation:
${context}

User question: ${query}

Please answer the question based on the provided context.`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    return 'Sorry, I encountered an error while generating a response.';
  }
}

async function ragQuery(query, options = {}) {
  console.log(`Processing query: "${query}"`);
  
  // Retrieve relevant documents
  const documents = await retrieveRelevantDocuments(query, options);
  
  if (documents.length === 0) {
    return 'I couldn\'t find any relevant information in the Ninja Agents SDK documentation.';
  }
  
  console.log(`Found ${documents.length} relevant documents`);
  
  // Generate response based on retrieved documents
  const response = await generateResponse(query, documents);
  
  return response;
}

// Example usage
async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node rag-example.js "your question here"');
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
  
  const answer = await ragQuery(query, options);
  
  console.log('\nAnswer:');
  console.log('=======\n');
  console.log(answer);
}

main().catch(console.error);