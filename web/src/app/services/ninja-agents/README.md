# Ninja Agents Services Layer

This directory contains the service layer configurations for the Ninja Agents SDK demonstration. It provides isolated, reusable configurations that showcase different orchestration patterns.

## 📁 Structure

```
services/ninja-agents/
├── shinobi/           # Agent configurations
│   └── researchDirectorShinobi.ts
├── katas/             # Task/skill configurations  
│   ├── researchAnalystKata.ts
│   ├── contentCreatorKata.ts
│   └── technicalWriterKata.ts
├── shurikens/         # Tool/capability configurations
│   ├── webSearchShuriken.ts
│   └── fileManagerShuriken.ts
├── clan/              # Multi-agent team configurations
│   └── exampleClan.ts
├── dojo/              # Workflow configurations
│   └── exampleDojo.ts
└── README.md          # This file
```

## 🥷 Shinobi (Agents)

Agent configurations with rich personas and specialized expertise:

- **`researchDirectorShinobi.ts`** - Research director with comprehensive analysis capabilities

## 🥋 Katas (Tasks/Skills)

Specialized task configurations that can be composed into larger workflows:

- **`researchAnalystKata.ts`** - Research and analysis specialist
- **`contentCreatorKata.ts`** - Content creation and writing specialist  
- **`technicalWriterKata.ts`** - Technical documentation specialist

## 🏹 Shurikens (Tools)

Atomic capabilities that can be used by any agent:

- **`webSearchShuriken.ts`** - Web search functionality (mock implementation)
- **`fileManagerShuriken.ts`** - File management operations (mock implementation)

## 👥 Clan (Multi-Agent Teams)

Configurations for coordinating multiple agents:

- **`exampleClan.ts`** - Collaborative team with research, technical, and business analysts

## 🏯 Dojo (Workflows)

Sequential workflow configurations:

- **`exampleDojo.ts`** - Two-step research and synthesis workflow

## 🎯 Usage Patterns

### Single Agent Execution
```typescript
import { Shinobi } from 'ninja-agents';
import { researchDirectorShinobi } from './shinobi/researchDirectorShinobi';

const shinobi = new Shinobi(runtime, researchDirectorShinobi);
const result = await shinobi.execute(userQuery);
```

### Multi-Agent Collaboration
```typescript
import { Clan } from 'ninja-agents';
import { exampleClan } from './clan/exampleClan';

const clan = new Clan(runtime, exampleClan);
const result = await clan.execute(userQuery);
```

### Sequential Workflows
```typescript
import { Dojo, Shinobi } from 'ninja-agents';
import { exampleDojo } from './dojo/exampleDojo';

const dojo = new Dojo(runtime, exampleDojo);
const workflow = dojo
  .start(firstAgent)
  .then(secondAgent);
const result = await workflow.execute(userQuery);
```

## 🔧 Configuration Guidelines

### Agent Personas
- Provide rich backstories and clear expertise areas
- Define specific roles and responsibilities
- Include relevant experience and credentials

### Task Specialization
- Keep tasks focused on specific domains
- Use appropriate model parameters for the task type
- Include clear descriptions of capabilities

### Tool Definitions
- Validate all inputs with Zod schemas
- Provide clear, descriptive names (a-zA-Z0-9_- only)
- Include comprehensive error handling

### Workflow Design
- Design for modularity and reusability
- Include appropriate error handling strategies
- Consider timeout and concurrency limits

## 🚀 Extending the Services

To add new configurations:

1. **New Agent**: Create in `shinobi/` with persona and kata definitions
2. **New Task**: Create in `katas/` with model and capability specifications
3. **New Tool**: Create in `shurikens/` with schema validation and implementation
4. **New Team**: Create in `clan/` with strategy and member definitions
5. **New Workflow**: Create in `dojo/` with step definitions and flow logic

## 📝 Best Practices

- Keep configurations focused and single-purpose
- Use descriptive names and comprehensive documentation
- Include error handling and validation
- Test configurations in isolation before integration
- Follow the established naming conventions
- Maintain clear separation between different orchestration patterns

This services layer demonstrates the flexibility and power of the Ninja Agents SDK while maintaining clean, modular, and reusable configurations.