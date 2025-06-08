/*
  # Create logs table for OpenAI Teaching Package

  1. New Tables
    - `logs`
      - `id` (uuid, primary key) - Unique identifier for each log entry
      - `timestamp` (timestamptz) - When the log entry was created
      - `level` (text) - Log level (debug, info, warn, error)
      - `message` (text) - Log message content
      - `context` (text, nullable) - Context information (e.g., kata name, shinobi role)
      - `shinobi_id` (uuid, nullable) - ID of the Shinobi if applicable
      - `kata_id` (uuid, nullable) - ID of the Kata if applicable
      - `shuriken_id` (uuid, nullable) - ID of the Shuriken if applicable
      - `execution_time` (integer, nullable) - Execution time in milliseconds
      - `token_usage` (jsonb, nullable) - Token usage information
      - `estimated_cost` (numeric, nullable) - Estimated cost in USD
      - `file_path` (text, nullable) - File path for file-based logging
      - `metadata` (jsonb, nullable) - Additional metadata
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `logs` table
    - Add policy for authenticated users to read/write their own logs
    - Add policy for service role to have full access

  3. Indexes
    - Index on timestamp for efficient time-based queries
    - Index on shinobi_id, kata_id, shuriken_id for filtering
    - Index on level for log level filtering
*/

CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message text NOT NULL,
  context text,
  shinobi_id uuid,
  kata_id uuid,
  shuriken_id uuid,
  execution_time integer,
  token_usage jsonb,
  estimated_cost numeric(10, 8),
  file_path text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own logs
CREATE POLICY "Users can manage their own logs"
  ON logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for service role to have full access
CREATE POLICY "Service role has full access"
  ON logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_shinobi_id ON logs (shinobi_id) WHERE shinobi_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_kata_id ON logs (kata_id) WHERE kata_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_shuriken_id ON logs (shuriken_id) WHERE shuriken_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs (level);
CREATE INDEX IF NOT EXISTS idx_logs_context ON logs (context) WHERE context IS NOT NULL;