# Quick Start

Let's build your first AI crew in under 5 minutes! This guide will walk you through creating a simple but powerful AI system.

## 🎯 What We're Building

We'll create a **Travel Assistant** that can:
- Get weather information for any city
- Perform cost calculations
- Provide comprehensive travel advice

## Step 1: Basic Setup

First, create a new file `travel-assistant.ts`:

```typescript
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { z } from 'zod';
import { 
  KataRuntime, 
  Shinobi, 
  Shuriken, 
  Logger, 
  Memory 
} from 'openai-teaching-package';

dotenv.config();

// Initialize core services
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});
const logger = new Logger('info', 'TravelAssistant', memory);
const runtime = new KataRuntime(openai, logger, memory);
```

## Step 2: Create Your First Shuriken

Shurikens are the capabilities your AI can use. Let's create a weather shuriken:

```typescript
// Weather capability
const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather information for any city',
  z.object({
    city: z.string().describe('The city name'),
    unit: z.enum(['celsius', 'fahrenheit']).optional()
  }),
  async (params) => {
    // In a real app, you'd call a weather API
    // For demo purposes, we'll return mock data
    const temp = params.unit === 'celsius' ? 22 : 72;
    const symbol = params.unit === 'celsius' ? '°C' : '°F';
    
    return {
      city: params.city,
      temperature: `${temp}${symbol}`,
      condition: 'Partly cloudy',
      humidity: '65%',
      windSpeed: '10 km/h'
    };
  }
);

// Calculator capability
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
      case 'divide': return params.b !== 0 ? params.a / params.b : 'Cannot divide by zero';
    }
  }
);
```

## Step 3: Create Your Shinobi

Now let's create a Shinobi (AI orchestrator) with a travel expert persona:

```typescript
const travelExpert = new Shinobi(runtime, {
  role: 'Expert Travel Assistant',
  description: 'A knowledgeable travel expert who provides comprehensive advice',
  backstory: 'I have 15+ years of experience in the travel industry, helping thousands of travelers plan perfect trips. I have extensive knowledge of destinations worldwide, weather patterns, and travel costs.',
  
  // Shared capabilities across all katas
  shurikens: [weatherShuriken, calculatorShuriken],
  
  // Specialized agents (katas) within this shinobi
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Weather Analysis Specialist',
      description: 'Analyze weather conditions and provide travel recommendations',
      parameters: { temperature: 0.7, max_tokens: 800 }
    },
    {
      model: 'gpt-4o-mini', 
      title: 'Cost Calculator',
      description: 'Calculate travel costs and provide budget advice',
      parameters: { temperature: 0.5, max_tokens: 600 }
    },
    {
      model: 'gpt-4o-mini',
      title: 'Destination Advisor',
      description: 'Provide destination recommendations and travel tips',
      parameters: { temperature: 0.8, max_tokens: 1000 }
    }
  ]
});
```

## Step 4: Execute Your AI Crew

Now let's put it all together and see your AI crew in action:

```typescript
async function main() {
  try {
    console.log('🥷 Travel Expert AI Crew Starting...\n');
    
    const result = await travelExpert.execute(
      'I want to plan a 5-day trip to Paris in December for 2 people. What\'s the weather like and what would be the estimated cost?'
    );
    
    console.log('\n📊 Execution Summary:');
    console.log(`💰 Total Cost: $${result.result.aggregatedBilling.estimatedCost.toFixed(6)}`);
    console.log(`🔢 Total Tokens: ${result.result.aggregatedBilling.tokenUsage.total_tokens}`);
    console.log(`⏱️ Execution Time: ${result.result.totalExecutionTime}ms`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
```

## Step 5: Run Your AI Crew

Save your file and run it:

```bash
npx tsx travel-assistant.ts
```

## 🎉 What Just Happened?

Your AI crew just:

1. **🥷 Shinobi Orchestration**: The Travel Expert coordinated multiple specialized agents
2. **🥋 Kata Execution**: Each Kata (Weather Analyst, Cost Calculator, Destination Advisor) contributed their expertise
3. **🗡️ Shuriken Usage**: The AI automatically decided when to use weather and calculator capabilities
4. **🧠 Intelligent Synthesis**: All insights were combined into a comprehensive travel plan

## 🔍 Understanding the Output

You'll see:
- **Real-time logging** of each step
- **Automatic tool usage** when the AI needs weather or calculations
- **Specialized analysis** from each Kata
- **Final synthesis** combining all expert perspectives
- **Cost and performance metrics**

## 🚀 Next Steps

Now that you have a working AI crew, explore:

- **[Core Concepts](../concepts/overview)** - Understand the architecture deeply
- **[Creating Shurikens](../guides/creating-shurikens)** - Build custom capabilities
- **[Building Katas](../guides/building-katas)** - Design specialized agents
- **[Orchestration Patterns](../guides/orchestration-patterns)** - Advanced coordination strategies

## 💡 Pro Tips

1. **Start Simple**: Begin with basic shurikens and gradually add complexity
2. **Clear Personas**: Give your Shinobi distinct personalities and expertise
3. **Focused Katas**: Keep each Kata specialized on a specific domain
4. **Monitor Costs**: Use the built-in token tracking to optimize performance
5. **Test Thoroughly**: Use the included test utilities to validate behavior

Ready to dive deeper? Let's explore the [core concepts](../concepts/overview) that make this all possible!