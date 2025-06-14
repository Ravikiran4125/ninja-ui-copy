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

This internal architecture ensures that agents can perform complex reasoning while maintaining a clean, simple external API.

## 🚀 Quick Start

### Installation

```bash
npm install ninja-agents zod openai
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
```

### 2. Using Kata with Scroll + Shuriken

```typescript
// Create a web search capability
const webSearchShuriken = new Shuriken(
  'web_search',
  'Search the web for information',
  z.object({
    query: z.string(),
    maxResults: z.number().optional()
  }),
  async (params) => {
    // Web search implementation
    return { results: [], totalResults: 0 };
  }
);

// Create a research kata that uses the search capability
const researchKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Research Specialist',
  description: 'Conduct comprehensive research using web search',
  shurikens: [webSearchShuriken],
  parameters: {
    temperature: 0.6,
    max_tokens: 1500
  }
});

const research = await researchKata.execute('Research the latest AI developments');
```

### 3. Running a Clan (Multi-Agent Coordination)

```typescript
// Define multiple expert agents
const technicalAnalyst = {
  role: 'Technical Analyst',
  description: 'Expert in technical analysis and system architecture',
  backstory: 'Senior technical architect with 15+ years of experience',
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
  maxConcurrency: 2
});

// Execute collaborative analysis
const teamResult = await analysisTeam.execute('Analyze the market opportunity for AI-powered customer service');
```

### 4. Running a Dojo (Sequential and Branching Logic)

```typescript
// Create a structured workflow
const researchWorkflow = new Dojo(runtime, {
  name: 'Comprehensive Research Pipeline',
  description: 'Multi-stage research and analysis workflow',
  errorHandling: 'continue'
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
```

## 🎯 Key Features

### Modular Architecture
- **Composable Components**: Build complex workflows from simple, reusable parts
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Clean Separation**: Clear boundaries between tools, tasks, agents, and workflows

### Advanced Orchestration
- **Multiple Strategies**: Sequential, parallel, competitive, collaborative execution
- **Conditional Logic**: Dynamic workflow branching based on runtime conditions
- **Error Handling**: Robust error handling and recovery mechanisms

### Persona-Driven Agents
- **Rich Backstories**: Agents with detailed personalities and expertise
- **Context Awareness**: Agents understand their role within larger workflows
- **Memory Integration**: Persistent context and learning capabilities

### Production Ready
- **Comprehensive Logging**: Detailed execution tracking and analytics
- **Cost Monitoring**: Token usage tracking and cost estimation
- **Scalable Design**: Built for production deployment and scaling

## 🔧 Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for logging and memory features
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ENABLE_DATABASE_LOGGING=true
ENABLE_FILE_LOGGING=false
```

### Runtime Configuration

```typescript
const runtime = new KataRuntime(openai, logger, memory);

// Configure memory
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true,
  enableFileLogging: false
});

// Configure logger
const logger = new Logger('info', 'MyApp', memory);
```

## 📊 Monitoring and Analytics

The SDK provides comprehensive monitoring capabilities:

```typescript
// Get execution statistics
const stats = await memory.getExecutionStats();
console.log(`Total executions: ${stats.total_executions}`);
console.log(`Total cost: $${stats.total_cost.toFixed(6)}`);

// Query specific logs
const recentErrors = await memory.queryLogs({
  level: 'error',
  limit: 10
});

// Get agent performance metrics
const agentStats = await shinobi.getTotalBillingInfo();
console.log(`Agent cost: $${shinobi.getTotalEstimatedCost().toFixed(6)}`);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:shuriken
npm run test:kata
npm run test:shinobi
```

## 📚 Documentation

- **[API Reference](./packages/ninja-agents/docs/)** - Complete API documentation
- **[Examples](./examples/)** - Comprehensive usage examples
- **[Migration Guide](./MIGRATION.md)** - Upgrading from previous versions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Related Projects

- [OpenAI API](https://platform.openai.com/docs) - AI model provider
- [Supabase](https://supabase.com/docs) - Database and authentication
- [Zod](https://zod.dev/) - Schema validation

---

**Built with ❤️ for the AI development community**

*Transform your ideas into intelligent, collaborative AI workflows with the Ninja Agents SDK.*