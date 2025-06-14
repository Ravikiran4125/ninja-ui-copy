# Migration Guide - Ninja Agents SDK

This guide helps you migrate to the latest version of the Ninja Agents SDK and adopt new features while maintaining compatibility with existing code.

## 📋 Migration Overview

### Current Version: 1.0.0
### Previous Version: 0.9.x

This major release introduces significant architectural improvements, new components, and enhanced capabilities while maintaining backward compatibility where possible.

## 🚨 Breaking Changes

### 1. Import Structure Changes

#### Before (0.9.x)
```typescript
import { Shinobi } from 'ninja-agents/core';
import { Kata } from 'ninja-agents/core';
import { Shuriken } from 'ninja-agents/core';
import { Memory } from 'ninja-agents/memory';
import { Logger } from 'ninja-agents/utils';
```

#### After (1.0.0)
```typescript
import { Shinobi, Kata, Shuriken, Memory, Logger, KataRuntime } from 'ninja-agents';
```

### 2. Runtime Dependency Injection

#### Before (0.9.x)
```typescript
const kata = new Kata({
  model: 'gpt-4o-mini',
  title: 'Research Analyst',
  openai: openaiClient,
  logger: logger,
  memory: memory
});
```

#### After (1.0.0)
```typescript
const runtime = new KataRuntime(openai, logger, memory);
const kata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Research Analyst'
});
```

### 3. Memory Configuration

#### Before (0.9.x)
```typescript
const memory = new Memory(supabaseClient);
```

#### After (1.0.0)
```typescript
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true,
  enableFileLogging: false
});
```

### 4. Shinobi Configuration

#### Before (0.9.x)
```typescript
const shinobi = new Shinobi({
  name: 'Research Expert',
  description: 'Expert researcher',
  katas: [kata1, kata2]
});
```

#### After (1.0.0)
```typescript
const shinobi = new Shinobi(runtime, {
  role: 'Research Expert',
  description: 'Expert researcher',
  backstory: 'Detailed background and expertise',
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Research Analyst',
      description: 'Conduct comprehensive research'
    }
  ]
});
```

## 🆕 New Features to Adopt

### 1. Clan Orchestration (Multi-Agent Coordination)

```typescript
import { Clan } from 'ninja-agents';

const analysisTeam = new Clan(runtime, {
  name: 'Analysis Team',
  description: 'Multi-perspective analysis',
  strategy: 'collaborative',
  shinobi: [
    technicalAnalyst,
    businessAnalyst,
    userResearcher
  ]
});

const result = await analysisTeam.execute('Analyze market opportunity');
```

### 2. Dojo Workflows (Sequential Orchestration)

```typescript
import { Dojo } from 'ninja-agents';

const workflow = new Dojo(runtime)
  .start(dataCollector)
  .then(primaryAnalyst)
  .parallel([reviewer1, reviewer2])
  .if(needsDeepDive, deepAnalyst)
  .then(synthesizer);

const result = await workflow.execute('Complex analysis task');
```

### 3. Enhanced Reasoning with Thought System

```typescript
// For individual Kata
const enhancedKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Advanced Analyst',
  description: 'Enhanced with reasoning capabilities',
  thoughtModule: {
    strategy: 'chain-of-thought',
    maxSteps: 5,
    temperature: 0.6
  }
});

// For Shinobi with multiple thought modules
const advancedShinobi = new Shinobi(runtime, {
  role: 'Strategic Analyst',
  description: 'Multi-perspective analysis',
  backstory: 'Expert in complex reasoning',
  thoughtModules: [
    { strategy: 'chain-of-thought', maxSteps: 3 },
    { strategy: 'reflection', maxSteps: 2 }
  ],
  katas: [/* kata configurations */]
});
```

### 4. Enhanced Memory and Analytics

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
const agentCost = shinobi.getTotalEstimatedCost();
const tokenUsage = shinobi.getTotalTokenUsage();
```

## 📝 Step-by-Step Migration Process

### Step 1: Update Dependencies

```bash
npm update ninja-agents
# or
npm install ninja-agents@latest
```

### Step 2: Update Import Statements

Create a migration script or manually update imports:

```typescript
// migration-helper.ts
export function migrateImports() {
  // Replace old import patterns with new unified imports
  // This can be automated with a script or done manually
}
```

### Step 3: Implement Runtime Pattern

```typescript
// old-setup.ts (Before)
const kata = new Kata({
  model: 'gpt-4o-mini',
  title: 'Analyst',
  openai: openaiClient,
  logger: logger,
  memory: memory
});

// new-setup.ts (After)
const runtime = new KataRuntime(openai, logger, memory);
const kata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Analyst'
});
```

### Step 4: Update Configuration Objects

```typescript
// Update Shinobi configurations
const oldShinobi = new Shinobi({
  name: 'Expert',
  description: 'Description',
  katas: [existingKata]
});

const newShinobi = new Shinobi(runtime, {
  role: 'Expert',
  description: 'Description',
  backstory: 'Detailed background',
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Specialist',
      description: 'Task description'
    }
  ]
});
```

### Step 5: Test Existing Functionality

```typescript
// Create test suite for migration validation
describe('Migration Tests', () => {
  it('should maintain existing functionality', async () => {
    const result = await migratedAgent.execute('test query');
    expect(result).toBeDefined();
    expect(result.result).toBeTruthy();
  });
});
```

### Step 6: Adopt New Features Incrementally

```typescript
// Start with basic new features
const clan = new Clan(runtime, {
  name: 'Simple Team',
  strategy: 'sequential',
  shinobi: [existingShinobi]
});

// Gradually add more complex features
const workflow = new Dojo(runtime)
  .start(existingShinobi)
  .then(newShinobi);
```

## 🔧 Configuration Migration

### Environment Variables

#### Before (0.9.x)
```bash
OPENAI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

#### After (1.0.0)
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

### Memory Configuration Migration

```typescript
// Before
const memory = new Memory(supabaseClient);

// After
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true,
  enableFileLogging: false,
  defaultFilePath: './logs/ninja-agents.jsonl'
});
```

### Logger Configuration Migration

```typescript
// Before
const logger = new Logger('info');

// After
const logger = new Logger('info', 'MyApp', memory);
```

## 🧪 Testing Migration

### Create Migration Tests

```typescript
// migration.test.ts
import { describe, it, expect } from 'vitest';
import { Shinobi, Kata, Shuriken, KataRuntime } from 'ninja-agents';

describe('Migration Compatibility', () => {
  let runtime: KataRuntime;

  beforeEach(() => {
    runtime = new KataRuntime(openai, logger, memory);
  });

  it('should maintain Shuriken functionality', async () => {
    const shuriken = new Shuriken(
      'test_tool',
      'Test tool',
      z.object({ value: z.number() }),
      (params) => params.value * 2
    );

    const result = await shuriken.execute({ value: 5 });
    expect(result.result).toBe(10);
  });

  it('should maintain Kata functionality', async () => {
    const kata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Test Kata',
      description: 'Test kata for migration'
    });

    const result = await kata.execute('test query');
    expect(result.result).toBeDefined();
  });

  it('should maintain Shinobi functionality', async () => {
    const shinobi = new Shinobi(runtime, {
      role: 'Test Agent',
      description: 'Test agent for migration',
      backstory: 'Test background',
      katas: [{
        model: 'gpt-4o-mini',
        title: 'Test Specialist',
        description: 'Test specialist'
      }]
    });

    const result = await shinobi.execute('test query');
    expect(result.result.finalAnswer).toBeDefined();
  });
});
```

### Validate New Features

```typescript
describe('New Features', () => {
  it('should support Clan orchestration', async () => {
    const clan = new Clan(runtime, {
      name: 'Test Clan',
      strategy: 'collaborative',
      shinobi: [testShinobi1, testShinobi2]
    });

    const result = await clan.execute('test query');
    expect(result.result.strategy).toBe('collaborative');
  });

  it('should support Dojo workflows', async () => {
    const dojo = new Dojo(runtime)
      .start(testShinobi1)
      .then(testShinobi2);

    const result = await dojo.execute('test query');
    expect(result.result.steps).toHaveLength(2);
  });

  it('should support enhanced reasoning', async () => {
    const enhancedKata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Enhanced Kata',
      description: 'Kata with thought module',
      thoughtModule: {
        strategy: 'chain-of-thought',
        maxSteps: 3
      }
    });

    const result = await enhancedKata.execute('test query');
    expect(result.result.enhancedReasoning).toBe(true);
  });
});
```

## 🚨 Common Migration Issues

### Issue 1: Import Errors

**Problem:**
```typescript
// Error: Module not found
import { Shinobi } from 'ninja-agents/core';
```

**Solution:**
```typescript
// Use unified imports
import { Shinobi } from 'ninja-agents';
```

### Issue 2: Configuration Errors

**Problem:**
```typescript
// Error: Constructor expects different parameters
const kata = new Kata(config);
```

**Solution:**
```typescript
// Use runtime dependency injection
const runtime = new KataRuntime(openai, logger, memory);
const kata = new Kata(runtime, config);
```

### Issue 3: Memory Initialization Errors

**Problem:**
```typescript
// Error: Memory constructor changed
const memory = new Memory(supabaseClient);
```

**Solution:**
```typescript
// Use new configuration object
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true
});
```

### Issue 4: Type Errors

**Problem:**
```typescript
// Error: Property 'name' does not exist on type 'ShinobiConfig'
const config = { name: 'Agent', description: 'Description' };
```

**Solution:**
```typescript
// Use 'role' instead of 'name'
const config = { 
  role: 'Agent', 
  description: 'Description',
  backstory: 'Background information'
};
```

## 📊 Performance Considerations

### Memory Usage Optimization

```typescript
// Before: Multiple client instances
const kata1 = new Kata({ openai: new OpenAI(), logger: new Logger() });
const kata2 = new Kata({ openai: new OpenAI(), logger: new Logger() });

// After: Shared runtime
const runtime = new KataRuntime(openai, logger, memory);
const kata1 = new Kata(runtime, config1);
const kata2 = new Kata(runtime, config2);
```

### Execution Efficiency

```typescript
// Use appropriate orchestration patterns
const parallelTeam = new Clan(runtime, {
  strategy: 'parallel', // For independent tasks
  shinobi: [analyst1, analyst2, analyst3]
});

const sequentialWorkflow = new Dojo(runtime)
  .start(dataCollector)
  .then(analyzer)
  .then(synthesizer); // For dependent tasks
```

## 🔒 Security Migration

### API Key Management

```typescript
// Before: Direct API key usage
const openai = new OpenAI({ apiKey: 'sk-...' });

// After: Environment variable usage
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Validate API key presence
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
```

### Memory Security

```typescript
// Configure secure memory
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  enableDatabaseLogging: true,
  enableFileLogging: false // Avoid file logging in production
});
```

## 📚 Additional Resources

### Documentation
- **[README.md](./README.md)** - Complete usage guide
- **[API Reference](./docs/)** - Detailed API documentation
- **[Examples](./examples/)** - Working code examples
- **[Security Guide](./SECURITY.md)** - Security best practices

### Support
- **[GitHub Issues](https://github.com/ninja-agents/ninja-agents/issues)** - Report migration issues
- **[Discussions](https://github.com/ninja-agents/ninja-agents/discussions)** - Community support
- **[Changelog](./CHANGELOG.md)** - Detailed change information

### Migration Tools

```bash
# Automated migration helper (if available)
npx ninja-agents-migrate

# Manual migration checklist
npm run migration-check
```

## ✅ Migration Checklist

- [ ] Update package dependencies
- [ ] Migrate import statements
- [ ] Implement runtime dependency injection
- [ ] Update configuration objects
- [ ] Test existing functionality
- [ ] Adopt new features incrementally
- [ ] Update environment variables
- [ ] Validate security configurations
- [ ] Run migration tests
- [ ] Update documentation and examples
- [ ] Deploy and monitor

## 🎯 Next Steps

After completing the migration:

1. **Explore New Features**: Try Clan and Dojo orchestration
2. **Enable Enhanced Reasoning**: Add thought modules to your agents
3. **Implement Analytics**: Use the enhanced memory system
4. **Optimize Performance**: Leverage new optimization features
5. **Enhance Security**: Apply new security best practices

For additional help with migration, please refer to our [support resources](#-additional-resources) or open an issue on GitHub.