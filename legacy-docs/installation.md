# Installation

Get started with the OpenAI Teaching Package in just a few steps.

## Prerequisites

Before installing, make sure you have:

- **Node.js 18+** installed on your system
- An **OpenAI API key** from [OpenAI Platform](https://platform.openai.com/api-keys)
- (Optional) A **Supabase project** for logging and memory features

## Installation

### 1. Install the Package

```bash
npm install openai-teaching-package
```

### 2. Install Dependencies

The package requires these peer dependencies:

```bash
npm install openai zod dotenv
```

For TypeScript projects, also install:

```bash
npm install -D typescript @types/node
```

### 3. Environment Setup

Create a `.env` file in your project root:

```env
# Required: OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Supabase Configuration (for logging and memory features)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Memory Configuration
ENABLE_DATABASE_LOGGING=true
ENABLE_FILE_LOGGING=false
DEFAULT_LOG_FILE_PATH=./logs/execution.jsonl
```

### 4. TypeScript Configuration

If using TypeScript, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Verification

Test your installation with this simple script:

```typescript
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { KataRuntime, Logger, Memory } from 'openai-teaching-package';

dotenv.config();

async function test() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const memory = new Memory({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
  });
  const logger = new Logger('info', 'test', memory);
  const runtime = new KataRuntime(openai, logger, memory);
  
  console.log('✅ OpenAI Teaching Package installed successfully!');
}

test().catch(console.error);
```

## Next Steps

Now that you have the package installed, let's [create your first AI crew](quick-start)!

## Troubleshooting

### Common Issues

**Missing OpenAI API Key**
```
Error: OPENAI_API_KEY environment variable is required
```
Make sure your `.env` file contains a valid OpenAI API key.

**Module Resolution Issues**
```
Cannot find module 'openai-teaching-package'
```
Ensure you've installed the package and its dependencies correctly.

**TypeScript Errors**
```
Cannot find type definitions
```
Install the required TypeScript dependencies and check your `tsconfig.json` configuration.

Need help? Check our [troubleshooting guide](../advanced/error-handling) or open an issue on GitHub.