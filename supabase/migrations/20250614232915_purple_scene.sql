-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table
CREATE TABLE IF NOT EXISTS ninja_agents_documents (
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
CREATE INDEX IF NOT EXISTS ninja_agents_documents_embedding_idx ON ninja_agents_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create a function for matching documents by vector similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  type TEXT,
  symbol TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.type,
    d.symbol,
    d.metadata,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM ninja_agents_documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create helper functions for RPC calls
CREATE OR REPLACE FUNCTION enable_pgvector_extension()
RETURNS VOID AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_documents_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS ninja_agents_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    type TEXT NOT NULL,
    symbol TEXT,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Create trigger for updated_at
  DROP TRIGGER IF EXISTS update_ninja_agents_documents_updated_at ON ninja_agents_documents;
  
  CREATE TRIGGER update_ninja_agents_documents_updated_at
  BEFORE UPDATE ON ninja_agents_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  
  -- Create index
  CREATE INDEX IF NOT EXISTS ninja_agents_documents_embedding_idx ON ninja_agents_documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_match_documents_function()
RETURNS VOID AS $$
BEGIN
  CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT
  )
  RETURNS TABLE (
    id UUID,
    content TEXT,
    type TEXT,
    symbol TEXT,
    metadata JSONB,
    similarity FLOAT
  )
  LANGUAGE plpgsql
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      d.id,
      d.content,
      d.type,
      d.symbol,
      d.metadata,
      1 - (d.embedding <=> query_embedding) AS similarity
    FROM ninja_agents_documents d
    WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;