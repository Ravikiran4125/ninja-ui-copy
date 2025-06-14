# Ninja Agents SDK - AI Crew Orchestration Framework

A comprehensive TypeScript framework for building sophisticated AI crew orchestration systems. Create specialized agents that work together to solve complex problems through modular, composable workflows.

## 🏗️ Architecture Overview

The Ninja Agents SDK follows a hierarchical architecture inspired by martial arts concepts:

### 🥷 **Shinobi** = Agent
Persona-driven orchestrators that manage multiple specialized agents (Kata) and coordinate complex workflows. Each Shinobi embodies a unique role with rich backstory and expertise.

```typescript
const travelExpert = new Shinobi(runtime, {
  role: 'Expert Travel Assistant',
  description: 'Knowledgeable travel expert with comprehensive planning abilities',
  backstory: '15+ years in travel industry, helped thousands plan perfect trips...',
  katas: [weatherAnalyst, costCalculator, destinationAdvisor]
});
```

### 🥋 **Kata** = Task (Reasoning Step)
Specialized AI agents focused on specific tasks and workflows. Each Kata encapsulates domain expertise and can use multiple tools (Shuriken) to accomplish its goals.

```typescript
const weatherAnalyst = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Weather Analysis Specialist',
  description: 'Analyze weather conditions and provide travel recommendations',
  shurikens: [weatherShuriken, calculatorShuriken]
});
```

### 🏹 **Shuriken** = Tool (Function or API)
Atomic, reusable capabilities that can be invoked by agents. Each Shuriken represents a specific function, API call, or capability with validated parameters.

```typescript
const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather information for a specific city',
  z.object({
    city: z.string(),
    unit: z.enum(['celsius', 'fahrenheit']).optional()
  }),
  async (params) => {
    // Implementation logic
    return { temperature: 25, condition: 'Sunny' };
  }
);
```

### 🏯 **Dojo** = Workflow (Directed Graph of Steps)
Workflow orchestration system with fluent API for creating complex agent workflows with conditional branching and parallel execution.

```typescript
const analysisWorkflow = new Dojo(runtime)
  .start(dataCollector)
  .then(primaryAnalyst)
  .parallel([technicalReviewer, businessReviewer])
  .if(needsDeepDive, deepAnalysisSpecialist)
  .then(synthesizer);
```

### 👥 **Clan** = Agent Ensemble (Multi-Agent Strategy)
Agent networks for coordinating multiple Shinobi with different execution strategies: sequential, parallel, competitive, collaborative, or conditional.

```typescript
const analysisTeam = new Clan(runtime, {
  name: 'Market Analysis Team',
  description: 'Comprehensive market analysis from multiple perspectives',
  strategy: 'collaborative',
  shinobi: [technicalAnalyst, businessAnalyst, userResearcher]
});
```

## 🧠 Internal Reasoning System

The SDK internally leverages a sophisticated reasoning system that is encapsulated and not exposed externally:

- **ThoughtModules**: Advanced reasoning engines for different cognitive patterns
- **PromptExecutor**: Intelligent prompt execution and optimization
- **ThoughtGraph**: Reasoning flow management and decision trees
- **Memory Systems**: Context storage, retrieval, and learning capabilities
- **Scroll Layer**: LLM provider abstraction for unified model access

This internal architecture ensures that agents can perform complex reasoning while maintaining a clean, simple external API.

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- TypeScript 5.0+
- OpenAI API key
- (Optional) Supabase project for logging and memory features

### Basic Installation

```bash
npm install ninja-agents zod openai
```

### With Optional Dependencies

```bash
npm install ninja-agents zod openai @supabase/supabase-js chalk dotenv
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/ninja-agents/ninja-agents
cd ninja-agents

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## 🚀 Quick Start

### Environment Setup

Create a `.env` file in your project root:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for logging and memory features
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ENABLE_DATABASE_LOGGING=true
ENABLE_FILE_LOGGING=false
DEFAULT_LOG_FILE_PATH=./logs/execution.jsonl
```

### Basic Setup

```typescript
import { Shinobi, Kata, Shuriken, KataRuntime, Logger, Memory } from 'ninja-agents';
import { z } from 'zod';
import OpenAI from 'openai';

// Initialize core services
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true,
  enableFileLogging: false
});
const logger = new Logger('info', 'MyApp', memory);
const runtime = new KataRuntime(openai, logger, memory);
```

## 📋 Usage Examples

### 1. Simple Shinobi with Multiple Kata

```typescript
// Create specialized capabilities
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

// Create a math expert agent
const mathExpert = new Shinobi(runtime, {
  role: 'Mathematics Expert',
  description: 'Expert mathematician and problem solver',
  backstory: 'PhD in Mathematics with 20 years of teaching experience',
  shurikens: [calculatorShuriken],
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Problem Solver',
      description: 'Solve mathematical problems step by step'
    },
    {
      model: 'gpt-4o-mini',
      title: 'Concept Explainer',
      description: 'Explain mathematical concepts clearly'
    }
  ]
});

// Execute complex problem solving
const result = await mathExpert.execute('What is 15% of 240, then multiply by 3?');
console.log(result.result.finalAnswer);
```

### 2. Using Kata with Enhanced Reasoning

```typescript
// Create a research kata with thought integration
const researchKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Research Specialist',
  description: 'Conduct comprehensive research with advanced reasoning',
  thoughtModule: {
    strategy: 'chain-of-thought',
    maxSteps: 5,
    temperature: 0.6
  },
  shurikens: [webSearchShuriken],
  parameters: {
    temperature: 0.6,
    max_tokens: 1500
  }
});

const research = await researchKata.execute('Research the latest AI developments');
console.log('Enhanced reasoning:', research.result.enhancedReasoning);
console.log('Thought process:', research.result.reasoning);
```

### 3. Running a Clan (Multi-Agent Coordination)

```typescript
// Define multiple expert agents
const technicalAnalyst = {
  role: 'Technical Analyst',
  description: 'Expert in technical analysis and system architecture',
  backstory: 'Senior technical architect with 15+ years of experience',
  thoughtModules: [
    { strategy: 'step-by-step', maxSteps: 4 }
  ],
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Technical Evaluator',
      description: 'Evaluate technical feasibility and architecture'
    }
  ]
};

const businessAnalyst = {
  role: 'Business Analyst',
  description: 'Strategic business analysis expert',
  backstory: 'MBA with 12+ years in business strategy and market analysis',
  thoughtModules: [
    { strategy: 'multi-perspective', perspectives: ['cost', 'benefit', 'risk'] }
  ],
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Market Researcher',
      description: 'Conduct market analysis and competitive research'
    }
  ]
};

// Create a collaborative clan
const analysisTeam = new Clan(runtime, {
  name: 'Multi-Perspective Analysis Team',
  description: 'Collaborative team providing comprehensive analysis',
  strategy: 'collaborative',
  shinobi: [technicalAnalyst, businessAnalyst],
  maxConcurrency: 2,
  timeout: 300000 // 5 minutes
});

// Execute collaborative analysis
const teamResult = await analysisTeam.execute('Analyze the market opportunity for AI-powered customer service');
console.log('Collaborative synthesis:', teamResult.result.synthesis);
```

### 4. Running a Dojo (Sequential and Branching Logic)

```typescript
// Create a structured workflow
const researchWorkflow = new Dojo(runtime, {
  name: 'Comprehensive Research Pipeline',
  description: 'Multi-stage research and analysis workflow',
  errorHandling: 'continue',
  maxRetries: 2
});

// Build the workflow with fluent API
const workflow = researchWorkflow
  .start(dataCollector)
  .then(primaryResearcher)
  .parallel([
    technicalAnalyst,
    marketAnalyst,
    competitorAnalyst
  ])
  .if(
    (context) => context.complexity > 0.8,
    deepAnalysisSpecialist
  )
  .then(synthesizer);

// Execute the complete workflow
const workflowResult = await workflow.execute('Comprehensive analysis of emerging AI technologies');
console.log('Workflow steps:', workflowResult.result.steps.length);
console.log('Final result:', workflowResult.result.finalResult);
```

## 🆕 Recent Updates & New Features

### Version 1.0.0 - Major Release

#### 🎯 New Components
- **Enhanced Ninja Layer**: User-facing API with integrated Thought System capabilities
- **Clan Orchestration**: Multi-agent coordination with various execution strategies
- **Dojo Workflows**: Sequential and parallel workflow orchestration with fluent API
- **Thought System Integration**: Advanced reasoning capabilities for enhanced AI performance

#### 🔧 API Changes
- **Breaking**: Restructured exports for better organization
- **New**: `Clan` class for multi-agent coordination
- **New**: `Dojo` class for workflow orchestration
- **Enhanced**: `Shinobi` and `Kata` with Thought System integration
- **Improved**: Memory system with comprehensive analytics

#### 📊 Configuration Updates
- **New**: `thoughtModule` configuration for individual Kata
- **New**: `thoughtModules` configuration for Shinobi orchestrators
- **Enhanced**: Memory configuration with database and file logging options
- **Improved**: Runtime configuration with better dependency injection

#### 🔗 Dependencies Changes
- **Updated**: OpenAI SDK to v4.0.0+
- **Added**: Enhanced Zod schema validation
- **Added**: Chalk for improved logging output
- **Optional**: Supabase client for persistent memory

## 🎯 Key Features

### Modular Architecture
- **Composable Components**: Build complex workflows from simple, reusable parts
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Clean Separation**: Clear boundaries between tools, tasks, agents, and workflows
- **Dual-Layer Design**: Ninja Layer for users, Core Layer for internal operations

### Advanced Orchestration
- **Multiple Strategies**: Sequential, parallel, competitive, collaborative execution
- **Conditional Logic**: Dynamic workflow branching based on runtime conditions
- **Error Handling**: Robust error handling and recovery mechanisms
- **Fluent API**: Intuitive workflow building with method chaining

### Enhanced Reasoning
- **Thought System**: Internal reasoning engine with multiple cognitive patterns
- **Chain-of-Thought**: Step-by-step reasoning for complex problems
- **Multi-Perspective**: Analysis from different viewpoints
- **Reflection**: Self-correction and validation capabilities

### Persona-Driven Agents
- **Rich Backstories**: Agents with detailed personalities and expertise
- **Context Awareness**: Agents understand their role within larger workflows
- **Memory Integration**: Persistent context and learning capabilities
- **Collaborative Intelligence**: Agents that work together effectively

### Production Ready
- **Comprehensive Logging**: Detailed execution tracking and analytics
- **Cost Monitoring**: Token usage tracking and cost estimation
- **Scalable Design**: Built for production deployment and scaling
- **Performance Optimization**: Efficient resource utilization

## 🔧 Advanced Configuration

### Runtime Configuration

```typescript
// Advanced runtime setup
const runtime = new KataRuntime(openai, logger, memory);

// Configure memory with custom settings
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true,
  enableFileLogging: false,
  defaultFilePath: './logs/ninja-agents.jsonl'
});

// Configure logger with tracking
const logger = new Logger('info', 'MyApp', memory);
```

### Model Configuration

```typescript
// Configure different models for different tasks
const researchKata = new Kata(runtime, {
  model: 'gpt-4o', // Use GPT-4 for complex research
  title: 'Senior Researcher',
  description: 'Advanced research with GPT-4',
  parameters: {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9
  }
});

const summaryKata = new Kata(runtime, {
  model: 'gpt-4o-mini', // Use mini for summaries
  title: 'Summary Writer',
  description: 'Efficient summarization',
  parameters: {
    temperature: 0.3,
    max_tokens: 500
  }
});
```

### Thought System Configuration

```typescript
// Configure advanced reasoning
const advancedShinobi = new Shinobi(runtime, {
  role: 'Strategic Analyst',
  description: 'Multi-perspective strategic analysis',
  backstory: 'Expert in complex reasoning and analysis',
  thoughtModules: [
    {
      strategy: 'chain-of-thought',
      maxSteps: 5,
      temperature: 0.6,
      validation: true
    },
    {
      strategy: 'reflection',
      maxSteps: 3,
      temperature: 0.4
    },
    {
      strategy: 'multi-perspective',
      perspectives: ['technical', 'business', 'user'],
      temperature: 0.7
    }
  ],
  katas: [/* kata configurations */]
});
```

## 📊 Monitoring and Analytics

### Execution Statistics

```typescript
// Get comprehensive execution statistics
const stats = await memory.getExecutionStats();
console.log(`Total executions: ${stats.total_executions}`);
console.log(`Total cost: $${stats.total_cost.toFixed(6)}`);
console.log(`Average execution time: ${stats.avg_execution_time}ms`);

// Get agent-specific statistics
const agentStats = await shinobi.getTotalBillingInfo();
console.log(`Agent cost: $${shinobi.getTotalEstimatedCost().toFixed(6)}`);
console.log(`Token usage:`, shinobi.getTotalTokenUsage());
```

### Query Logs

```typescript
// Query specific logs
const recentErrors = await memory.queryLogs({
  level: 'error',
  limit: 10,
  start_time: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
});

// Get logs for specific agent
const shinobiLogs = await memory.queryLogs({
  shinobi_id: shinobi.getId(),
  limit: 50
});

// Get performance logs
const performanceLogs = await memory.queryLogs({
  level: 'info',
  limit: 100
});
```

### Real-time Monitoring

```typescript
// Set up real-time monitoring
const logger = new Logger('info', 'Production', memory);

// Track execution metrics
logger.timing('agent_execution', executionTime);
logger.billing('$0.001234', 'gpt-4o-mini');
logger.tokenUsage({ prompt: 150, completion: 75, total: 225 });
```

## 🔒 Security Best Practices

### API Key Management

```typescript
// Use environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Validate API key presence
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
```

### Input Validation

```typescript
// Always validate Shuriken inputs
const secureShuriken = new Shuriken(
  'secure_operation',
  'Secure operation with validation',
  z.object({
    input: z.string().min(1).max(1000),
    type: z.enum(['safe_type_1', 'safe_type_2'])
  }),
  async (params) => {
    // Additional validation
    if (containsUnsafeContent(params.input)) {
      throw new Error('Unsafe input detected');
    }
    return processSecurely(params);
  }
);
```

### Memory Security

```typescript
// Configure secure memory
const secureMemory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true,
  enableFileLogging: false // Avoid file logging in production
});
```

## 🚀 Performance Optimization

### Efficient Resource Usage

```typescript
// Use appropriate models for tasks
const efficientWorkflow = new Dojo(runtime)
  .start(new Kata(runtime, {
    model: 'gpt-4o-mini', // Fast for initial processing
    title: 'Quick Analyzer'
  }))
  .if(
    (context) => context.needsDeepAnalysis,
    new Kata(runtime, {
      model: 'gpt-4o', // Powerful for complex analysis
      title: 'Deep Analyzer'
    })
  );
```

### Parallel Execution

```typescript
// Use Clan for parallel processing
const parallelTeam = new Clan(runtime, {
  name: 'Parallel Analysis Team',
  strategy: 'parallel',
  shinobi: [analyst1, analyst2, analyst3],
  maxConcurrency: 3
});
```

### Caching and Memory

```typescript
// Implement result caching
const cachedResults = new Map();

const cachingShuriken = new Shuriken(
  'cached_operation',
  'Operation with caching',
  schema,
  async (params) => {
    const key = JSON.stringify(params);
    if (cachedResults.has(key)) {
      return cachedResults.get(key);
    }
    
    const result = await expensiveOperation(params);
    cachedResults.set(key, result);
    return result;
  }
);
```

## 🧪 Testing

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest';
import { Shuriken, Kata, Shinobi } from 'ninja-agents';

describe('Ninja Agents', () => {
  it('should create and execute a Shuriken', async () => {
    const testShuriken = new Shuriken(
      'test_operation',
      'Test operation',
      z.object({ value: z.number() }),
      (params) => params.value * 2
    );

    const result = await testShuriken.execute({ value: 5 });
    expect(result.result).toBe(10);
  });

  it('should execute a Kata with Shuriken', async () => {
    const kata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Test Kata',
      description: 'Testing kata execution',
      shurikens: [testShuriken]
    });

    const result = await kata.execute('Test query');
    expect(result.result).toBeDefined();
  });
});
```

### Integration Testing

```typescript
describe('Integration Tests', () => {
  it('should orchestrate multiple agents', async () => {
    const clan = new Clan(runtime, {
      name: 'Test Clan',
      strategy: 'collaborative',
      shinobi: [testShinobi1, testShinobi2]
    });

    const result = await clan.execute('Integration test query');
    expect(result.result.strategy).toBe('collaborative');
  });
});
```

### Performance Testing

```typescript
describe('Performance Tests', () => {
  it('should complete execution within time limit', async () => {
    const startTime = Date.now();
    const result = await shinobi.execute('Performance test');
    const executionTime = Date.now() - startTime;
    
    expect(executionTime).toBeLessThan(30000); // 30 seconds
    expect(result.executionTime).toBeDefined();
  });
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. OpenAI API Key Issues
```typescript
// Check API key configuration
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable');
}

// Test API connection
try {
  const response = await openai.models.list();
  console.log('API connection successful');
} catch (error) {
  console.error('API connection failed:', error.message);
}
```

#### 2. Memory Configuration Issues
```typescript
// Test memory configuration
const memory = new Memory(config);
if (!memory.isDatabaseLoggingEnabled()) {
  console.warn('Database logging is disabled');
}

// Test database connection
try {
  await memory.log({
    level: 'info',
    message: 'Test log entry'
  });
  console.log('Memory logging successful');
} catch (error) {
  console.error('Memory logging failed:', error.message);
}
```

#### 3. Shuriken Validation Errors
```typescript
// Debug Shuriken validation
const validation = shuriken.validate(params);
if (!validation.success) {
  console.error('Validation failed:', validation.error);
  // Fix parameters based on error message
}
```

#### 4. Agent Execution Timeouts
```typescript
// Configure timeouts
const clan = new Clan(runtime, {
  name: 'Timeout Test',
  strategy: 'parallel',
  shinobi: [shinobi1, shinobi2],
  timeout: 60000 // 1 minute timeout
});
```

### Debug Mode

```typescript
// Enable debug logging
const debugLogger = new Logger('debug', 'DebugMode', memory);
const debugRuntime = new KataRuntime(openai, debugLogger, memory);

// Use debug runtime for troubleshooting
const debugShinobi = new Shinobi(debugRuntime, config);
```

## 📚 API Reference

### Core Classes

- **[Shuriken](./docs/classes/Shuriken.md)** - Atomic AI capabilities
- **[Kata](./docs/classes/Kata.md)** - Specialized AI agents
- **[Shinobi](./docs/classes/Shinobi.md)** - Persona-driven orchestrators
- **[Clan](./docs/classes/Clan.md)** - Multi-agent coordination
- **[Dojo](./docs/classes/Dojo.md)** - Workflow orchestration
- **[Memory](./docs/classes/Memory.md)** - Persistent storage and analytics
- **[Logger](./docs/classes/Logger.md)** - Structured logging system

### Utility Classes

- **[KataRuntime](./docs/classes/KataRuntime.md)** - Dependency injection container
- **[ThoughtModule](./docs/classes/ThoughtModule.md)** - Advanced reasoning engine
- **[PromptExecutor](./docs/classes/PromptExecutor.md)** - Intelligent prompt execution

### Type Definitions

- **[Types Reference](./docs/types.md)** - Complete type definitions
- **[Configuration Interfaces](./docs/interfaces.md)** - Configuration options
- **[Execution Results](./docs/results.md)** - Result type definitions

## 🌟 Examples and Tutorials

### Getting Started Tutorial
1. **[Basic Setup](./docs/tutorials/basic-setup.md)** - Initial configuration
2. **[First Shuriken](./docs/tutorials/first-shuriken.md)** - Creating your first tool
3. **[Simple Kata](./docs/tutorials/simple-kata.md)** - Building a specialized agent
4. **[Agent Orchestration](./docs/tutorials/orchestration.md)** - Coordinating multiple agents

### Advanced Examples
- **[Research Assistant](./examples/research-assistant/)** - Comprehensive research workflow
- **[Content Creation Pipeline](./examples/content-pipeline/)** - Multi-stage content creation
- **[Technical Analysis Team](./examples/technical-analysis/)** - Collaborative technical analysis
- **[Customer Service Bot](./examples/customer-service/)** - Multi-agent customer support

### Integration Guides
- **[Next.js Integration](./docs/integrations/nextjs.md)** - Using with Next.js applications
- **[Express.js Integration](./docs/integrations/express.md)** - Backend API integration
- **[Supabase Setup](./docs/integrations/supabase.md)** - Database and memory configuration
- **[Production Deployment](./docs/integrations/production.md)** - Production deployment guide

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ninja-agents/ninja-agents
cd ninja-agents

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Generate documentation
npm run docs:generate
```

### Contribution Guidelines

1. **Fork the repository** and create a feature branch
2. **Add tests** for new functionality
3. **Ensure all tests pass** with `npm test`
4. **Update documentation** for API changes
5. **Follow TypeScript best practices**
6. **Submit a pull request** with clear description

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Related Projects

- **[OpenAI API](https://platform.openai.com/docs)** - AI model provider
- **[Supabase](https://supabase.com/docs)** - Database and authentication
- **[Zod](https://zod.dev/)** - Schema validation
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

## 🆘 Support

- **[Documentation](./docs/)** - Comprehensive documentation
- **[Examples](./examples/)** - Working code examples
- **[GitHub Issues](https://github.com/ninja-agents/ninja-agents/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/ninja-agents/ninja-agents/discussions)** - Community discussions

---

**Built with ❤️ for the AI development community**

*Transform your ideas into intelligent, collaborative AI workflows with the Ninja Agents SDK.*