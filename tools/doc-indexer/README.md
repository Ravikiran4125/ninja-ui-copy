# Ninja Doc Indexer

A smart document indexing pipeline for the Ninja Agents SDK that extracts, chunks, embeds, and stores structured content from markdown, TypeScript, and Typedoc JSON using metaphor-driven tagging.

## Features

- Ingests documentation and code from `/legacy-docs/` and `/packages/ninja-agents/`
- Chunks intelligently by headings, exports, and symbols
- Tags chunks using Ninja metaphors (`Shinobi`, `Kata`, `Dojo`, `Shuriken`)
- Embeds using OpenAI (`text-embedding-3-small`)
- Stores with metadata in Supabase `ninja_agents_documents`
- Supports dry runs for estimating cost/token usage

## Installation

```bash
cd tools/doc-indexer
npm install
```

## Configuration

Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

Required environment variables:

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
LOG_LEVEL=info
BATCH_SIZE=10
CACHE_ENABLED=true
DRY_RUN=false
EMBED_AND_STORE=true
```

## Usage

Run the indexer:

```bash
node index.js
```

For a dry run (no embedding or storage):

```bash
DRY_RUN=true node index.js
```

## Database Setup

The indexer requires a Supabase table with the following schema:

```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table
CREATE TABLE ninja_agents_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  type TEXT NOT NULL,
  symbol TEXT,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function
CREATE TRIGGER update_ninja_agents_documents_updated_at
BEFORE UPDATE ON ninja_agents_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create an index for vector similarity search
CREATE INDEX ninja_agents_documents_embedding_idx ON ninja_agents_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## Querying Indexed Documents

Example of querying the indexed documents using vector similarity:

```javascript
const { createClient } = require('@supabase/supabase-js');
const { Configuration, OpenAIApi } = require('openai');

// Initialize clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

async function queryDocuments(query, limit = 5) {
  // Generate embedding for the query
  const embeddingResponse = await openai.createEmbedding({
    model: 'text-embedding-3-small',
    input: query,
  });
  
  const [{ embedding }] = embeddingResponse.data.data;
  
  // Query the database
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit
  });
  
  if (error) {
    console.error('Error querying documents:', error);
    return [];
  }
  
  return data;
}

// Example usage
queryDocuments('How do I create a Shinobi agent?').then(console.log);
```

## Architecture

The indexer is organized into the following components:

- **Processors**: Handle different file types (Markdown, TypeScript, Typedoc)
- **Embedders**: Generate embeddings using OpenAI
- **Storage**: Store documents in Supabase
- **Utils**: File collection, chunk validation, logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request