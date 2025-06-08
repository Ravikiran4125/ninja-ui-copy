# OpenAI Teaching Package - AI Crew Orchestration System

A comprehensive TypeScript package demonstrating advanced AI crew orchestration using OpenAI API with specialized agents (Shinobi), workflows (Kata), and capabilities (Shuriken).

## 🎯 Core Concepts

### Architecture Overview
- **Shinobi**: Persona-driven orchestrators that manage multiple specialized agents
- **Kata**: Specialized AI agents focused on specific tasks and workflows  
- **Shuriken**: Specific capabilities/functions that agents can invoke
- **Orchestra**: High-level orchestration systems that coordinate multiple Shinobi for complex workflows

### Key Features
- ✅ Modular, reusable AI agent definitions
- ✅ Comprehensive testing suite
- ✅ Multiple orchestration patterns
- ✅ Collaborative multi-agent workflows
- ✅ Token usage tracking and cost estimation
- ✅ Persistent logging with Supabase integration
- ✅ Clean separation of concerns

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- (Optional) Supabase project for logging

### Installation
```bash
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for logging and memory features
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ENABLE_DATABASE_LOGGING=true
```

### Run Examples
```bash
# Run basic OpenAI examples
npm run dev

# Run orchestration demos
npm run orchestration

# Run test suite
npm run test
```

## 🏗️ Project Structure

```
src/
├── core/                    # Core framework components
│   ├── kata.ts             # AI agent workflows
│   ├── shinobi.ts          # Agent orchestrators
│   ├── shuriken.ts         # AI capabilities/functions
│   ├── kataRuntime.ts      # Dependency injection container
│   ├── memory.ts           # Persistent storage and logging
│   └── types.ts            # Type definitions
├── definitions/             # Centralized component definitions
│   ├── shurikens/          # Reusable AI capabilities
│   ├── katas/              # Specialized agent workflows
│   └── shinobi/            # Persona-driven orchestrators
├── orchestrations/          # High-level orchestration systems
│   ├── travelPlanningOrchestra.ts
│   ├── researchOrchestra.ts
│   ├── digitalConsultingOrchestra.ts
│   └── collaborativeOrchestra.ts
├── utils/                   # Utility functions and helpers
│   ├── billingCalculator.ts
│   ├── openaiUtils.ts
│   ├── Logger.ts
│   └── testRunner.ts
└── __tests__/              # Comprehensive test suites
```

## 🎼 Orchestration Examples

### 1. Travel Planning Orchestra
Specialized travel assistance with weather analysis, cost calculation, and destination recommendations.

```typescript
const travelOrchestra = new TravelPlanningOrchestra(openai, logger, memory);
await travelOrchestra.execute('Plan a 7-day trip to Japan in March for 2 people');
```

### 2. Research Orchestra  
Comprehensive research and analysis with content creation and technical documentation.

```typescript
const researchOrchestra = new ResearchOrchestra(openai, logger, memory);
await researchOrchestra.execute('Analyze AI trends and business applications');
```

### 3. Digital Consulting Orchestra
Strategic digital consulting with research, technical documentation, and content creation.

```typescript
const digitalOrchestra = new DigitalConsultingOrchestra(openai, logger, memory);
await digitalOrchestra.execute('Develop digital transformation strategy for retail company');
```

### 4. Collaborative Orchestra
Multi-expert collaborative analysis combining multiple Shinobi perspectives.

```typescript
const collaborativeOrchestra = new CollaborativeOrchestra(openai, logger, memory);
await collaborativeOrchestra.execute('Start a sustainable travel blog business');
```

## 🧪 Testing

The package includes comprehensive testing for all utility functions and core components:

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch
```

Test coverage includes:
- Billing calculator functionality
- OpenAI utility functions
- Shuriken creation and execution
- Schema validation and conversion

## 🔧 Core Components

### Shuriken (AI Capabilities)
Reusable AI functions that can be shared across multiple agents:

```typescript
// Example: Weather capability
export const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather information for a specific city',
  weatherSchema,
  getWeatherImplementation
);
```

### Kata (AI Agents)
Specialized workflows focused on specific tasks:

```typescript
// Example: Weather analysis specialist
export const weatherAnalysisKata: KataConfig = {
  model: 'gpt-4o-mini',
  title: 'Weather Analysis Specialist',
  description: 'Analyze weather conditions and provide travel recommendations',
  requiresHumanInput: false,
  parameters: { temperature: 0.7, max_tokens: 1000 }
};
```

### Shinobi (Orchestrators)
Persona-driven coordinators that manage multiple Kata:

```typescript
// Example: Travel expert with multiple specializations
export const travelExpertShinobi: ShinobiConfig = {
  role: 'Expert Travel Assistant',
  description: 'Knowledgeable travel expert with 15+ years experience',
  backstory: 'Extensive knowledge of destinations worldwide...',
  katas: [weatherAnalysisKata, costCalculatorKata, destinationRecommenderKata]
};
```

## 📊 Features

### Token Tracking & Cost Estimation
- Real-time token usage monitoring
- Accurate cost estimation for different models
- Aggregated billing across multi-agent workflows

### Persistent Logging
- Supabase integration for structured logging
- Execution statistics and performance metrics
- Searchable logs with context and metadata

### Collaborative Workflows
- Multi-Shinobi orchestration
- Cross-perspective synthesis
- Conflict resolution and integration

### Clean Architecture
- Dependency injection with KataRuntime
- Modular, reusable components
- Clear separation of concerns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🔗 Related

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Schema Validation](https://zod.dev/)