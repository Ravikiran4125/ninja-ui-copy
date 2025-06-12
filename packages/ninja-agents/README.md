# ninja-agents

Composable AI Agent Orchestration Framework

`ninja-agents` lets you build, compose, and orchestrate powerful AI agents (`Shinobi`), skills (`Kata`), and tools (`Shuriken`) for advanced automation and reasoning. Designed for modularity, extensibility, and ease of integration in modern TypeScript/Node.js projects.

---

## 📖 Table of Contents
- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Folder Structure (Recommended)](#folder-structure-recommended)
- [Getting Started](#getting-started)
- [Defining Shuriken, Kata, Shinobi, Orchestration](#defining-shuriken-kata-shinobi-orchestration)
- [Full Orchestration Example](#full-orchestration-example)
- [Exports Reference](#exports-reference)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

---

## 🧠 Overview

**ninja-agents** is a composable, scalable AI agent framework for building next-generation automation, assistants, and reasoning systems. It provides:
- **Shuriken**: Modular tools/functions (API calls, calculators, file ops, etc)
- **Kata**: Skills/tasks that use tools (e.g., "analyze weather", "summarize text")
- **Shinobi**: Agents that combine skills, memory, and reasoning
- **Orchestration**: Compose and chain agents for complex workflows

> **Analogy**: Think of a Shinobi (agent) as a ninja, a Kata as a martial arts move/skill, and a Shuriken as the tool/weapon the ninja uses!

---

## 🧩 Core Concepts

### ![Shuriken](https://emojicdn.elk.sh/🌀) Shuriken (Tool)
- Atomic, reusable function (API call, DB op, web search, etc)
- Validated with [zod](https://zod.dev/) schemas
- Named with only `a-zA-Z0-9_-`

### ![Kata](https://emojicdn.elk.sh/🥋) Kata (Skill)
- Encapsulates a task or domain skill
- Uses one or more shuriken
- Implements business logic

### ![Shinobi](https://emojicdn.elk.sh/🥷) Shinobi (Agent)
- Composable AI agent
- Orchestrates katas (skills)
- Can use memory, reasoning, and chaining

### ![Orchestration](https://emojicdn.elk.sh/🎼) Orchestration
- Compose multiple agents for multi-step workflows
- Chain, parallelize, or branch execution

### ![Memory](https://emojicdn.elk.sh/🧠) Memory
- Store/retrieve context, history, or results
- Use built-in or custom memory adapters

---

## 🗂️ Folder Structure (Recommended)

```
my-app/
  shinobi/         # Custom Shinobi agent definitions
  katas/           # Custom Kata (skills/tasks)
  shuriken/        # Custom Shuriken (tools/functions)
  orchestrations/  # Compose and use orchestras as needed
  api/
    route.ts       # (Recommended) Instantiate and run orchestras here
```

---

## 🚀 Getting Started

### 1. Install
```bash
npm install ninja-agents zod
```

### 2. Environment Setup
- Node.js 18+
- (Optional) OpenAI API key for LLM-backed agents
- (Optional) Supabase/DB for persistent memory

### 3. Import Core Classes
```ts
import { Shuriken, Kata, Shinobi } from 'ninja-agents';
```

---

## 🛠️ Defining Shuriken, Kata, Shinobi, Orchestration

### 1. Define a Shuriken (Tool)
```ts
// shuriken/webSearchShuriken.ts
import { Shuriken } from 'ninja-agents';
import { z } from 'zod';

const webSearchSchema = z.object({
  query: z.string(),
  maxResults: z.number().optional()
});

export const webSearchShuriken = new Shuriken(
  'web_search',
  'Perform a web search for a query.',
  webSearchSchema,
  async ({ query, maxResults }) => {
    // ...implementation...
    return { results: [] };
  }
);
```

### 2. Define a Kata (Skill)
```ts
// katas/weatherAnalysisKata.ts
import { Kata } from 'ninja-agents';
import { weatherShuriken } from '../shuriken/weatherShuriken';

export const weatherAnalysisKata = new Kata({
  title: 'Weather Analysis',
  description: 'Analyze weather for a destination.',
  tools: [weatherShuriken],
  implementation: async ({ input, tools }) => {
    return await tools.weatherShuriken({ city: input.city });
  }
});
```

### 3. Define a Shinobi (Agent)
```ts
// shinobi/travelExpertShinobi.ts
import { Shinobi } from 'ninja-agents';
import { weatherAnalysisKata } from '../katas/weatherAnalysisKata';

export const travelExpertShinobi = new Shinobi({
  title: 'Travel Expert',
  description: 'Expert agent for travel planning',
  katas: [weatherAnalysisKata],
  memory: true
});
```

### 4. Compose an Orchestra (Workflow)
```ts
// orchestrations/travelPlanningOrchestra.ts
import { travelExpertShinobi } from '../shinobi/travelExpertShinobi';

export async function runTravelOrchestration(userQuery: string) {
  return await travelExpertShinobi.execute({ input: userQuery });
}
```

### 5. Use in an API Route
```ts
// api/route.ts
import { runTravelOrchestration } from '../orchestrations/travelPlanningOrchestra';

export default async function handler(req, res) {
  const result = await runTravelOrchestration(req.body.query);
  res.json(result);
}
```

---

## 🎯 Full Orchestration Example

**Sequential orchestration:**
```ts
import { travelExpertShinobi } from '../shinobi/travelExpertShinobi';
import { costAnalystShinobi } from '../shinobi/costAnalystShinobi';

export async function planTrip(userQuery) {
  const weather = await travelExpertShinobi.execute({ input: userQuery });
  const cost = await costAnalystShinobi.execute({ input: userQuery });
  return { weather, cost };
}
```

**Parallel orchestration:**
```ts
import { travelExpertShinobi } from '../shinobi/travelExpertShinobi';
import { destinationShinobi } from '../shinobi/destinationShinobi';

export async function planTripParallel(userQuery) {
  const [weather, destinations] = await Promise.all([
    travelExpertShinobi.execute({ input: userQuery }),
    destinationShinobi.execute({ input: userQuery })
  ]);
  return { weather, destinations };
}
```

---

## 📦 Exports Reference

| Export         | Type      | Description                                 |
|---------------|-----------|---------------------------------------------|
| Shuriken      | class     | Tool/function definition                    |
| Kata          | class     | Skill/task definition                       |
| Shinobi       | class     | Agent definition                            |
| Memory        | class     | Agent memory management                     |
| KataConfig    | type      | Kata configuration type                     |
| ShinobiConfig | type      | Shinobi configuration type                  |
| MemoryConfig  | type      | Memory configuration type                   |
| Orchestration | class     | (If exported) Compose agents and workflows  |

---

## ⚡ Advanced Usage
- **Custom Memory**: Plug in your own memory adapter (DB, Redis, etc)
- **Logging**: Add hooks for logging agent/tool execution
- **Chaining**: Dynamically chain agents/katas based on runtime logic
- **Error Handling**: Catch and handle errors at every layer
- **Testing**: Mock tool/agent implementations for fast tests

---

## 🛠️ Troubleshooting & FAQ

**Q: My shuriken/tool is not being called?**
- Make sure its name is only letters, numbers, underscores, or hyphens.
- Validate your input schema with zod.

**Q: How do I add persistent memory?**
- Use the `Memory` class and provide your own storage backend.

**Q: Can I use this in a Next.js API route?**
- Yes! Instantiate orchestration logic inside the route handler.

**Q: How do I debug agent reasoning?**
- Add logging to your kata/shinobi implementations.

**Q: Can I use OpenAI or other LLMs?**
- Yes, just provide the API key and use LLM-backed katas.

---

## 📝 Best Practices
- **Keep agents, skills, and tools modular**: One file per definition.
- **Validate all tool input** with zod schemas.
- **Name all shuriken** with only letters, numbers, underscores, or hyphens.
- **Instantiate orchestration logic** inside API routes or backend handlers for best scalability and isolation.
- **Export all major definitions** from your folders for easy import and composition.
- **Write tests** for every agent, kata, and tool.

---

## 🤝 Contributing
PRs and issues welcome! Please add tests for new features.

---

## License
MIT
