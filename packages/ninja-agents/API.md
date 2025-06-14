# Ninja Agents SDK - API Documentation

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-repo/ninja-agents)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Components](#core-components)
  - [Shuriken (Tools)](#shuriken-tools)
  - [Kata (Skills)](#kata-skills)
  - [Shinobi (Agents)](#shinobi-agents)
  - [Memory](#memory)
  - [KataRuntime](#kataruntime)
- [Utilities](#utilities)
  - [Logger](#logger)
  - [Billing Calculator](#billing-calculator)
  - [OpenAI Utils](#openai-utils)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Ninja Agents SDK is a comprehensive TypeScript framework for building sophisticated AI crew orchestration systems. It provides a clean, modular architecture for creating AI agents that can work together to solve complex problems.

### Key Features

- 🔧 **Modular Design**: Clean separation of concerns with reusable components
- 🎭 **Persona-Driven**: Rich character-based AI agents with backstories and expertise
- 🔄 **Multi-Turn Conversations**: Sophisticated dialogue management
- 📊 **Token Tracking**: Built-in cost monitoring and usage analytics
- 💾 **Persistent Memory**: Supabase integration for logging and state management
- 🧪 **Comprehensive Testing**: Full test suite with utilities

## Installation

```bash
npm install ninja-agents zod openai
```

### Peer Dependencies

```bash
npm install @supabase/supabase-js chalk dotenv
```

### Environment Setup

Create a `.env` file:

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

## Quick Start

```typescript
import OpenAI from 'openai';
import { KataRuntime, Shinobi, Shuriken, Logger, Memory } from 'ninja-agents';
import { z } from 'zod';

// Initialize core services
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});
const logger = new Logger('info', 'MyApp', memory);
const runtime = new KataRuntime(openai, logger, memory);

// Create a simple capability
const calculatorShuriken = new Shuriken(
  'calculate',
  'Perform mathematical calculations',
  z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  (params) => {
    switch (params.operation) {
      case 'add': return params.a + params.b;
      case 'subtract': return params.a - params.b;
      case 'multiply': return params.a * params.b;
      case 'divide': return params.a / params.b;
    }
  }
);

// Create and execute a Shinobi
const mathExpert = new Shinobi(runtime, {
  role: 'Mathematics Expert',
  description: 'A skilled mathematician who can solve complex problems',
  backstory: 'PhD in Mathematics with 20 years of teaching experience',
  shurikens: [calculatorShuriken],
  katas: [{
    model: 'gpt-4o-mini',
    title: 'Problem Solver',
    description: 'Solve mathematical problems step by step'
  }]
});

const result = await mathExpert.execute('What is 15% of 240, and then multiply that by 3?');
```

## Core Components

### Shuriken (Tools)

Shurikens are atomic, reusable functions that AI agents can invoke to perform concrete actions.

#### Constructor

```typescript
new Shuriken(name: string, description: string, schema: z.ZodSchema, implementation: Function)
```

**Parameters:**
- `name` (string): Function name for AI tool calling
- `description` (string): Description to help AI decide when to use it
- `schema` (z.ZodSchema): Zod schema for parameter validation
- `implementation` (Function): The actual function implementation

#### Methods

##### `forge(): OpenAI.Chat.Completions.ChatCompletionTool`

Generates the OpenAI tool definition for this shuriken.

**Returns:** OpenAI-compatible tool definition

**Example:**
```typescript
const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather information',
  z.object({
    city: z.string().describe('City name'),
    unit: z.enum(['celsius', 'fahrenheit']).optional()
  }),
  async (params) => {
    // Implementation here
    return { temperature: 25, condition: 'Sunny' };
  }
);

const toolDefinition = weatherShuriken.forge();
```

##### `validate(parameters: any): { success: boolean; data?: any; error?: string }`

Validates parameters against the shuriken's schema.

**Parameters:**
- `parameters` (any): Parameters to validate

**Returns:** Validation result object

**Example:**
```typescript
const validation = weatherShuriken.validate({ city: 'Paris' });
if (validation.success) {
  console.log('Valid parameters:', validation.data);
} else {
  console.error('Validation error:', validation.error);
}
```

##### `execute(parameters: any): Promise<ExecutionResult<any>>`

Executes the shuriken with validated parameters.

**Parameters:**
- `parameters` (any): Parameters for execution

**Returns:** Promise resolving to ExecutionResult

**Example:**
```typescript
const result = await calculatorShuriken.execute({
  operation: 'add',
  a: 5,
  b: 3
});
console.log('Result:', result.result); // 8
console.log('Execution time:', result.executionTime); // e.g., 2ms
```

#### Best Practices

- Keep shurikens focused on a single responsibility
- Use descriptive names and descriptions
- Validate all inputs with Zod schemas
- Handle errors gracefully
- Use async functions for I/O operations

### Kata (Skills)

Katas represent specialized AI agents focused on specific tasks and workflows.

#### Constructor

```typescript
new Kata(runtime: KataRuntime, config: KataConfig)
```

**Parameters:**
- `runtime` (KataRuntime): Dependency injection container
- `config` (KataConfig): Configuration object

#### KataConfig Interface

```typescript
interface KataConfig {
  model: string;                    // OpenAI model (e.g., 'gpt-4o-mini')
  title: string;                    // Descriptive title
  description: string;              // Detailed description
  shurikens?: Shuriken[];          // Available capabilities
  stream?: boolean;                 // Enable streaming (default: false)
  responseSchema?: z.ZodSchema;     // For structured output
  parameters?: OpenAIParameters;    // Model parameters
  shinobiPersona?: ShinobiPersonaContext; // Persona context
  requiresHumanInput?: boolean;     // Requires human input (default: false)
}
```

#### Methods

##### `execute(userQuery: string): Promise<ExecutionResult<string | any>>`

Executes the kata with a user query.

**Parameters:**
- `userQuery` (string): User's request or question

**Returns:** Promise resolving to ExecutionResult

**Example:**
```typescript
const weatherAnalyst = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Weather Analysis Specialist',
  description: 'Analyze weather conditions for travel planning',
  shurikens: [weatherShuriken],
  parameters: { temperature: 0.7, max_tokens: 1000 }
});

const result = await weatherAnalyst.execute('What\'s the weather like in Tokyo?');
```

##### `addShuriken(shuriken: Shuriken): void`

Adds a shuriken capability to this kata.

**Parameters:**
- `shuriken` (Shuriken): The shuriken to add

**Example:**
```typescript
kata.addShuriken(calculatorShuriken);
kata.addShuriken(weatherShuriken);
```

### Shinobi (Agents)

Shinobi are persona-driven orchestrators that manage multiple specialized agents (Katas).

#### Constructor

```typescript
new Shinobi(runtime: KataRuntime, config: ShinobiConfig)
```

#### ShinobiConfig Interface

```typescript
interface ShinobiConfig {
  role: string;                     // Role or title
  description: string;              // Brief description of expertise
  backstory: string;               // Rich backstory for personality
  katas: KataConfig[];             // Managed katas
  shurikens?: Shuriken[];          // Shared shurikens
}
```

#### Methods

##### `execute(userQuery: string): Promise<ExecutionResult<ShinobiExecutionResult>>`

Executes the Shinobi workflow with all configured katas.

**Returns:** Promise resolving to comprehensive execution result

**Example:**
```typescript
const travelExpert = new Shinobi(runtime, {
  role: 'Expert Travel Assistant',
  description: 'Knowledgeable travel expert',
  backstory: '15+ years in travel industry...',
  shurikens: [weatherShuriken, calculatorShuriken],
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Weather Analyst',
      description: 'Analyze weather conditions'
    },
    {
      model: 'gpt-4o-mini',
      title: 'Cost Calculator',
      description: 'Calculate travel costs'
    }
  ]
});

const result = await travelExpert.execute('Plan a 5-day trip to Paris');
```

### Memory

Persistent storage and logging system for the AI crew orchestration framework.

#### Constructor

```typescript
new Memory(config?: MemoryConfig)
```

#### MemoryConfig Interface

```typescript
interface MemoryConfig {
  supabaseUrl?: string;
  supabaseKey?: string;
  defaultFilePath?: string;
  enableDatabaseLogging?: boolean;
  enableFileLogging?: boolean;
}
```

#### Methods

##### `log(logEntry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string>`

Logs an entry to configured destinations.

**Example:**
```typescript
const logId = await memory.log({
  level: 'info',
  message: 'Shinobi execution completed',
  context: 'TravelExpert',
  execution_time: 2500,
  estimated_cost: 0.001234
});
```

##### `queryLogs(filters?: LogFilters): Promise<LogEntry[]>`

Queries logs with filtering options.

**Example:**
```typescript
const recentErrors = await memory.queryLogs({
  level: 'error',
  limit: 5
});
```

### KataRuntime

Dependency injection container providing centralized access to core services.

#### Constructor

```typescript
new KataRuntime(openai: OpenAI, logger: Logger, memory?: Memory)
```

#### Properties

- `openai`: OpenAI client instance
- `logger`: Base logger instance
- `memory`: Memory instance (optional)

## Utilities

### Logger

Structured logging with multiple levels and memory integration.

#### Constructor

```typescript
new Logger(level?: LogLevel, context?: string, memory?: Memory)
```

#### Methods

```typescript
logger.debug(message: string, metadata?: Record<string, any>): void
logger.info(message: string, metadata?: Record<string, any>): void
logger.warn(message: string, metadata?: Record<string, any>): void
logger.error(message: string, metadata?: Record<string, any>): void
```

### Billing Calculator

Utilities for calculating OpenAI API costs.

#### Functions

```typescript
calculateCost(model: string, tokenUsage: TokenUsage): number
createBillingInfo(model: string, tokenUsage: TokenUsage): BillingInfo
formatCost(cost: number): string
getSupportedModels(): string[]
```

## Examples

### Creating a Research Assistant

```typescript
import { Shinobi, Shuriken } from 'ninja-agents';
import { z } from 'zod';

// Create web search capability
const webSearchShuriken = new Shuriken(
  'web_search',
  'Search the web for information',
  z.object({
    query: z.string(),
    maxResults: z.number().optional()
  }),
  async (params) => {
    // Implementation
    return { results: [] };
  }
);

// Create research assistant
const researcher = new Shinobi(runtime, {
  role: 'Research Director',
  description: 'Experienced researcher and analyst',
  backstory: '20+ years in academic and corporate research',
  shurikens: [webSearchShuriken],
  katas: [{
    model: 'gpt-4o-mini',
    title: 'Research Analyst',
    description: 'Conduct comprehensive research and analysis'
  }]
});

const result = await researcher.execute('Research the latest trends in AI');
```

### Streaming with Structured Output

```typescript
const structuredKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Story Generator',
  description: 'Generate structured stories',
  stream: true,
  responseSchema: z.object({
    title: z.string(),
    genre: z.string(),
    plot: z.string()
  })
});

const result = await structuredKata.execute('Create a sci-fi story');
```

## Best Practices

### Shuriken Design

1. **Single Responsibility**: Each shuriken should do one thing well
2. **Clear Naming**: Use descriptive names that indicate the function's purpose
3. **Robust Validation**: Always validate inputs with Zod schemas
4. **Error Handling**: Handle errors gracefully and return meaningful messages
5. **Documentation**: Provide clear descriptions for AI decision-making

### Kata Configuration

1. **Focused Expertise**: Keep each kata specialized on a specific domain
2. **Appropriate Models**: Choose the right model for the task complexity
3. **Parameter Tuning**: Adjust temperature and other parameters for optimal results
4. **Resource Management**: Monitor token usage and costs

### Shinobi Orchestration

1. **Clear Personas**: Define distinct roles and backstories
2. **Logical Flow**: Organize katas in a logical sequence
3. **Shared Resources**: Use shared shurikens efficiently
4. **Result Synthesis**: Ensure final answers integrate all kata insights

## Troubleshooting

### Common Issues

**Shuriken not being called**
- Verify the name contains only `a-zA-Z0-9_-` characters
- Check parameter schema validation
- Ensure description is clear and helpful

**High token usage**
- Reduce max_tokens parameter
- Optimize prompt engineering
- Use more efficient models for simple tasks

**Memory/logging issues**
- Verify Supabase credentials
- Check network connectivity
- Ensure proper permissions

### Error Codes

| Error | Description | Solution |
|-------|-------------|----------|
| `OPENAI_API_KEY_MISSING` | OpenAI API key not configured | Set OPENAI_API_KEY environment variable |
| `PARAMETER_VALIDATION_FAILED` | Invalid parameters for shuriken | Check parameter types and required fields |
| `SUPABASE_CONNECTION_FAILED` | Cannot connect to Supabase | Verify URL and key configuration |

### Performance Optimization

1. **Model Selection**: Use `gpt-4o-mini` for most tasks, `gpt-4o` for complex reasoning
2. **Token Management**: Set appropriate max_tokens limits
3. **Caching**: Implement result caching for repeated queries
4. **Parallel Execution**: Use Promise.all for independent operations

---

For more examples and advanced usage patterns, see the [examples directory](./examples/) and [test files](./src/**/__tests__/).