# Installation Guide - Ninja Agents SDK

Complete installation and setup guide for the Ninja Agents SDK, covering all deployment scenarios from development to production.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **TypeScript**: 5.0.0 or higher
- **npm**: 8.0.0 or higher (or yarn/pnpm equivalent)

### Required Services
- **OpenAI API**: Account and API key required
- **Supabase** (Optional): For persistent memory and analytics

### Supported Platforms
- **Operating Systems**: Windows, macOS, Linux
- **Environments**: Node.js, Browser (with bundler), Edge Runtime
- **Frameworks**: Next.js, Express.js, Fastify, Nuxt.js, SvelteKit

## 🚀 Quick Installation

### Basic Installation

```bash
# Using npm
npm install ninja-agents zod openai

# Using yarn
yarn add ninja-agents zod openai

# Using pnpm
pnpm add ninja-agents zod openai
```

### With Optional Dependencies

```bash
# Full installation with all optional features
npm install ninja-agents zod openai @supabase/supabase-js chalk dotenv

# TypeScript development dependencies
npm install -D typescript @types/node tsx
```

## 🔧 Environment Setup

### 1. Environment Variables

Create a `.env` file in your project root:

```bash
# Required - OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Supabase Configuration (for memory and logging)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - Memory Configuration
ENABLE_DATABASE_LOGGING=true
ENABLE_FILE_LOGGING=false
DEFAULT_LOG_FILE_PATH=./logs/execution.jsonl

# Optional - Performance Configuration
MAX_CONCURRENT_EXECUTIONS=5
DEFAULT_TIMEOUT=30000
```

### 2. TypeScript Configuration

Create or update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Package.json Scripts

Add useful scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  }
}
```

## 🏗️ Framework-Specific Setup

### Next.js Integration

#### 1. Install Next.js Dependencies
```bash
npm install next react react-dom
npm install -D @types/react @types/react-dom
```

#### 2. Create API Route
```typescript
// pages/api/agents/route.ts or app/api/agents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Shinobi, KataRuntime, Logger, Memory } from 'ninja-agents';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});
const logger = new Logger('info', 'NextJS', memory);
const runtime = new KataRuntime(openai, logger, memory);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    const shinobi = new Shinobi(runtime, {
      role: 'Assistant',
      description: 'Helpful AI assistant',
      backstory: 'Expert in various domains',
      katas: [{
        model: 'gpt-4o-mini',
        title: 'General Assistant',
        description: 'Handle general queries'
      }]
    });

    const result = await shinobi.execute(query);
    return NextResponse.json({ result: result.result.finalAnswer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
```

#### 3. Environment Configuration
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
```

### Express.js Integration

#### 1. Install Express Dependencies
```bash
npm install express cors helmet
npm install -D @types/express @types/cors
```

#### 2. Create Express Server
```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Shinobi, KataRuntime, Logger, Memory } from 'ninja-agents';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize Ninja Agents
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});
const logger = new Logger('info', 'Express', memory);
const runtime = new KataRuntime(openai, logger, memory);

// Routes
app.post('/api/agents/execute', async (req, res) => {
  try {
    const { query, agentConfig } = req.body;
    
    const shinobi = new Shinobi(runtime, agentConfig);
    const result = await shinobi.execute(query);
    
    res.json({ result: result.result.finalAnswer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute agent' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### Serverless Deployment

#### Vercel
```typescript
// api/agents.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Shinobi, KataRuntime, Logger, Memory } from 'ninja-agents';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const logger = new Logger('info', 'Vercel');
    const runtime = new KataRuntime(openai, logger);

    const { query } = req.body;
    const shinobi = new Shinobi(runtime, {
      role: 'Assistant',
      description: 'Serverless AI assistant',
      backstory: 'Optimized for serverless execution',
      katas: [{
        model: 'gpt-4o-mini',
        title: 'Quick Assistant',
        description: 'Fast responses for serverless'
      }]
    });

    const result = await shinobi.execute(query);
    res.json({ result: result.result.finalAnswer });
  } catch (error) {
    res.status(500).json({ error: 'Execution failed' });
  }
}
```

#### AWS Lambda
```typescript
// lambda/handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Shinobi, KataRuntime, Logger } from 'ninja-agents';
import OpenAI from 'openai';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const logger = new Logger('info', 'Lambda');
    const runtime = new KataRuntime(openai, logger);

    const { query } = JSON.parse(event.body || '{}');
    
    const shinobi = new Shinobi(runtime, {
      role: 'Lambda Assistant',
      description: 'AWS Lambda AI assistant',
      backstory: 'Optimized for AWS Lambda execution',
      katas: [{
        model: 'gpt-4o-mini',
        title: 'Lambda Handler',
        description: 'Handle Lambda requests efficiently'
      }]
    });

    const result = await shinobi.execute(query);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ result: result.result.finalAnswer }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Execution failed' }),
    };
  }
};
```

## 🗄️ Database Setup (Optional)

### Supabase Setup

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

#### 2. Create Database Schema
```sql
-- Create logs table for Ninja Agents
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

-- Create policy for authenticated users
CREATE POLICY "Users can manage their own logs"
  ON logs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_shinobi_id ON logs (shinobi_id) WHERE shinobi_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_kata_id ON logs (kata_id) WHERE kata_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs (level);
```

#### 3. Configure Environment
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
ENABLE_DATABASE_LOGGING=true
```

### Alternative Database Setup

#### PostgreSQL
```typescript
// For direct PostgreSQL connection
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Custom memory implementation
class PostgreSQLMemory extends Memory {
  constructor() {
    super({
      enableDatabaseLogging: false, // Disable Supabase
      enableFileLogging: true
    });
  }
  
  async log(entry: LogEntry): Promise<string> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO logs (level, message, context, metadata) VALUES ($1, $2, $3, $4) RETURNING id',
        [entry.level, entry.message, entry.context, entry.metadata]
      );
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }
}
```

## 🧪 Testing Setup

### Basic Testing Configuration

#### 1. Install Testing Dependencies
```bash
npm install -D vitest @vitest/ui jsdom
```

#### 2. Create Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

#### 3. Create Test Setup
```typescript
// src/test/setup.ts
import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

beforeAll(() => {
  dotenv.config({ path: '.env.test' });
});

afterAll(() => {
  // Cleanup
});
```

#### 4. Create Test Environment
```bash
# .env.test
OPENAI_API_KEY=test_key
ENABLE_DATABASE_LOGGING=false
ENABLE_FILE_LOGGING=false
```

### Example Tests

```typescript
// src/test/agents.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Shinobi, Kata, Shuriken, KataRuntime, Logger } from 'ninja-agents';
import { z } from 'zod';

describe('Ninja Agents', () => {
  let runtime: KataRuntime;

  beforeEach(() => {
    const mockOpenAI = {} as any; // Mock OpenAI client
    const logger = new Logger('info', 'Test');
    runtime = new KataRuntime(mockOpenAI, logger);
  });

  it('should create and execute a Shuriken', async () => {
    const testShuriken = new Shuriken(
      'test_tool',
      'Test tool',
      z.object({ value: z.number() }),
      (params) => params.value * 2
    );

    const result = await testShuriken.execute({ value: 5 });
    expect(result.result).toBe(10);
  });

  it('should validate Shuriken parameters', () => {
    const testShuriken = new Shuriken(
      'validation_test',
      'Validation test',
      z.object({ required: z.string() }),
      (params) => params.required
    );

    const validation = testShuriken.validate({ required: 'test' });
    expect(validation.success).toBe(true);

    const invalidValidation = testShuriken.validate({});
    expect(invalidValidation.success).toBe(false);
  });
});
```

## 🚀 Production Deployment

### Environment Configuration

#### Production Environment Variables
```bash
# Production .env
NODE_ENV=production
OPENAI_API_KEY=your_production_api_key
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
ENABLE_DATABASE_LOGGING=true
ENABLE_FILE_LOGGING=false
LOG_LEVEL=info
MAX_CONCURRENT_EXECUTIONS=10
DEFAULT_TIMEOUT=60000
```

#### Security Configuration
```typescript
// src/config/production.ts
export const productionConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
    maxRetries: 3,
  },
  memory: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    enableDatabaseLogging: true,
    enableFileLogging: false,
  },
  logger: {
    level: 'info',
    context: 'Production',
  },
  performance: {
    maxConcurrentExecutions: 10,
    defaultTimeout: 60000,
    enableCaching: true,
  },
};
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  ninja-agents-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=ninja_agents
      - POSTGRES_USER=ninja
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Kubernetes Deployment

#### Deployment Configuration
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ninja-agents-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ninja-agents-app
  template:
    metadata:
      labels:
        app: ninja-agents-app
    spec:
      containers:
      - name: ninja-agents-app
        image: ninja-agents:latest
        ports:
        - containerPort: 3000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ninja-agents-secrets
              key: openai-api-key
        - name: SUPABASE_URL
          valueFrom:
            configMapKeyRef:
              name: ninja-agents-config
              key: supabase-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 🔍 Troubleshooting

### Common Installation Issues

#### Issue 1: Node.js Version Compatibility
```bash
# Check Node.js version
node --version

# Update Node.js if needed
nvm install 18
nvm use 18
```

#### Issue 2: TypeScript Compilation Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist

# Reinstall dependencies
npm ci
npm run build
```

#### Issue 3: OpenAI API Key Issues
```typescript
// Validate API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

try {
  await openai.models.list();
  console.log('API key is valid');
} catch (error) {
  console.error('Invalid API key:', error.message);
}
```

#### Issue 4: Supabase Connection Issues
```typescript
// Test Supabase connection
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});

try {
  await memory.log({
    level: 'info',
    message: 'Connection test'
  });
  console.log('Supabase connection successful');
} catch (error) {
  console.error('Supabase connection failed:', error.message);
}
```

### Performance Optimization

#### Memory Usage
```typescript
// Monitor memory usage
process.on('exit', () => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
  });
});
```

#### Connection Pooling
```typescript
// Optimize OpenAI client usage
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 3,
});

// Reuse runtime instances
const globalRuntime = new KataRuntime(openaiClient, logger, memory);
```

## 📚 Next Steps

After successful installation:

1. **[Quick Start Guide](./README.md#quick-start)** - Basic usage examples
2. **[API Reference](./docs/)** - Detailed API documentation
3. **[Examples](./examples/)** - Working code examples
4. **[Best Practices](./README.md#best-practices)** - Production guidelines

## 🆘 Support

If you encounter issues during installation:

- **[GitHub Issues](https://github.com/ninja-agents/ninja-agents/issues)** - Report installation problems
- **[Discussions](https://github.com/ninja-agents/ninja-agents/discussions)** - Community support
- **[Documentation](./README.md)** - Complete usage guide

For additional help, please provide:
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Operating system
- Error messages and stack traces
- Installation steps attempted