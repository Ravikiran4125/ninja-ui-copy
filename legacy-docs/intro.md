# Welcome to OpenAI Teaching Package

The **OpenAI Teaching Package** is a comprehensive TypeScript framework for building sophisticated AI crew orchestration systems. It provides a clean, modular architecture for creating AI agents that can work together to solve complex problems.

## 🎯 What is AI Crew Orchestration?

AI Crew Orchestration is a design pattern where multiple specialized AI agents work together, each with their own expertise and capabilities, to accomplish complex tasks that would be difficult for a single AI to handle effectively.

## 🏗️ Core Architecture

Our system is built around three fundamental concepts:

### 🥷 **Shinobi** - The Orchestrators
Persona-driven coordinators that manage multiple specialized agents (Katas). Think of them as team leaders with specific expertise and personality.

### 🥋 **Kata** - The Specialists  
Individual AI agents focused on specific tasks and workflows. Each Kata represents a specialized skill or domain of knowledge.

### 🗡️ **Shuriken** - The Capabilities
Specific functions or tools that agents can invoke to perform concrete actions like calculations, API calls, or data processing.

## ✨ Key Features

- **🔧 Modular Design**: Clean separation of concerns with reusable components
- **🎭 Persona-Driven**: Rich character-based AI agents with backstories and expertise
- **🔄 Multi-Turn Conversations**: Sophisticated dialogue management
- **📊 Token Tracking**: Built-in cost monitoring and usage analytics  
- **💾 Persistent Memory**: Supabase integration for logging and state management
- **🧪 Comprehensive Testing**: Full test suite with utilities
- **📈 Performance Monitoring**: Execution time and cost tracking

## 🚀 Quick Example

```typescript
import { KataRuntime, Shinobi, Shuriken } from 'openai-teaching-package';
import { z } from 'zod';

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

// Create a runtime and shinobi
const runtime = new KataRuntime(openai, logger, memory);
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

// Execute a complex math problem
const result = await mathExpert.execute(
  'What is 15% of 240, and then multiply that by 3?'
);
```

## 🎓 Learning Path

1. **[Installation](getting-started/installation)** - Set up your development environment
2. **[Quick Start](getting-started/quick-start)** - Build your first AI crew
3. **[Core Concepts](concepts/overview)** - Understand the architecture
4. **[Examples](examples/basic-usage)** - See real-world implementations
5. **[Advanced Topics](advanced/custom-orchestrations)** - Master complex patterns

## 🤝 Community & Support

- 📚 **Documentation**: Comprehensive guides and API reference
- 🐛 **Issues**: Report bugs and request features on GitHub
- 💬 **Discussions**: Join our community discussions
- 📧 **Support**: Get help from our team

Ready to build your AI crew? Let's [get started](getting-started/installation)!