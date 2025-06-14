# 🔄 Thought System Migration Guide

This guide helps you migrate from direct Thought System access to the proper Ninja Layer architecture.

## 🚨 Why Migration is Required

The Thought System has been redesigned with strict architectural boundaries:

- **Security**: Prevents unauthorized access to internal reasoning
- **Integrity**: Maintains proper system boundaries
- **Maintainability**: Ensures clean separation of concerns
- **Performance**: Optimizes reasoning context management

## 📋 Migration Checklist

### 1. Identify Direct Usage Patterns

Run these commands to find direct Thought System usage:

```bash
# Find direct imports
grep -r "import.*Thought" src/ --include="*.ts" --include="*.js"

# Find direct instantiation
grep -r "new Thought" src/ --include="*.ts" --include="*.js"

# Find direct executor usage
grep -r "PromptExecutor" src/ --include="*.ts" --include="*.js"
```

### 2. Common Anti-Patterns to Fix

#### ❌ Anti-Pattern 1: Direct ThoughtModule Instantiation
```typescript
// BEFORE (Anti-pattern)
import { ThoughtModule, PromptExecutor } from 'ninja-agents';

const executor = new PromptExecutor(openai, 'gpt-4o-mini');
const thoughtModule = new ThoughtModule({
  strategy: 'chain-of-thought',
  maxSteps: 5
}, executor);

const result = await thoughtModule.think({
  input: userQuery,
  memory: {},
  trace: [],
  metadata: {}
});
```

```typescript
// AFTER (Correct)
import { Kata } from 'ninja-agents';

const kata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Reasoning Specialist',
  description: 'Enhanced with thought capabilities',
  thoughtModule: {
    strategy: 'chain-of-thought',
    maxSteps: 5
  }
});

const result = await kata.execute(userQuery);
// Access thought results: result.result.thoughtResult
```

#### ❌ Anti-Pattern 2: Direct ThoughtRuntime Usage
```typescript
// BEFORE (Anti-pattern)
import { ThoughtRuntime } from 'ninja-agents';

const thoughtRuntime = new ThoughtRuntime(openai);
const modules = [
  thoughtRuntime.createModule(config1),
  thoughtRuntime.createModule(config2)
];

const results = await Promise.all(
  modules.map(module => thoughtRuntime.run(module, query))
);
```

```typescript
// AFTER (Correct)
import { Shinobi } from 'ninja-agents';

const shinobi = new Shinobi(runtime, {
  role: 'Multi-Perspective Analyst',
  description: 'Advanced reasoning with multiple modules',
  backstory: 'Expert in complex analysis',
  thoughtModules: [config1, config2],
  katas: [{
    model: 'gpt-4o-mini',
    title: 'Analysis Specialist',
    description: 'Comprehensive analysis'
  }]
});

const result = await shinobi.execute(query);
// Access thought results: result.result.thoughtResults
```

#### ❌ Anti-Pattern 3: Manual Prompt Strategy Implementation
```typescript
// BEFORE (Anti-pattern)
import { PromptStrategy, PromptExecutor } from 'ninja-agents';

const strategy = new PromptStrategy('reflection');
const executor = new PromptExecutor(openai, 'gpt-4o-mini');

const prompt = strategy.buildPrompt(userQuery, context);
const result = await executor.execute(prompt);
```

```typescript
// AFTER (Correct)
import { Kata } from 'ninja-agents';

const kata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Reflective Analyst',
  description: 'Uses reflection strategy for deep analysis',
  thoughtModule: {
    strategy: 'reflection',
    temperature: 0.6,
    maxSteps: 3
  }
});

const result = await kata.execute(userQuery);
```

## 🔧 Step-by-Step Migration Process

### Step 1: Update Imports

```typescript
// BEFORE
import { 
  ThoughtModule, 
  ThoughtRuntime, 
  PromptExecutor,
  PromptStrategy 
} from 'ninja-agents';

// AFTER
import { 
  Shinobi, 
  Kata, 
  Clan, 
  Dojo 
} from 'ninja-agents';
```

### Step 2: Convert Direct Instantiation to Configuration

```typescript
// BEFORE: Direct instantiation
const thoughtModule = new ThoughtModule({
  strategy: 'chain-of-thought',
  maxSteps: 5,
  temperature: 0.7
}, executor);

// AFTER: Configuration-based
const kataConfig = {
  model: 'gpt-4o-mini',
  title: 'Chain of Thought Specialist',
  description: 'Systematic reasoning specialist',
  thoughtModule: {
    strategy: 'chain-of-thought',
    maxSteps: 5,
    temperature: 0.7
  }
};
```

### Step 3: Update Execution Patterns

```typescript
// BEFORE: Direct execution
const thoughtResult = await thoughtModule.think(context);
const finalAnswer = thoughtResult.output;

// AFTER: Ninja Layer execution
const kataResult = await kata.execute(userQuery);
const thoughtResult = kataResult.result.thoughtResult;
const finalAnswer = kataResult.result.standardResult;
```

### Step 4: Handle Multiple Thought Modules

```typescript
// BEFORE: Manual orchestration
const modules = [
  new ThoughtModule(config1, executor),
  new ThoughtModule(config2, executor)
];

const results = await Promise.all(
  modules.map(module => module.think(context))
);

// AFTER: Shinobi orchestration
const shinobi = new Shinobi(runtime, {
  role: 'Multi-Modal Analyst',
  description: 'Combines multiple reasoning approaches',
  backstory: 'Expert in comprehensive analysis',
  thoughtModules: [config1, config2],
  katas: [{
    model: 'gpt-4o-mini',
    title: 'Synthesis Specialist',
    description: 'Synthesizes multiple reasoning approaches'
  }]
});

const result = await shinobi.execute(userQuery);
const thoughtResults = result.result.thoughtResults;
```

## 🧪 Testing Your Migration

### 1. Validation Tests

Create tests to ensure your migration works correctly:

```typescript
import { describe, it, expect } from 'vitest';
import { Kata } from 'ninja-agents';

describe('Thought System Migration', () => {
  it('should execute enhanced kata with thought module', async () => {
    const kata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Test Kata',
      description: 'Testing thought integration',
      thoughtModule: {
        strategy: 'chain-of-thought',
        maxSteps: 3
      }
    });

    const result = await kata.execute('Test query');
    
    expect(result.result.enhancedReasoning).toBe(true);
    expect(result.result.thoughtResult).toBeDefined();
    expect(result.result.standardResult).toBeDefined();
  });
});
```

### 2. Integration Tests

Test the complete workflow:

```typescript
describe('Enhanced Shinobi Integration', () => {
  it('should orchestrate multiple thought modules', async () => {
    const shinobi = new Shinobi(runtime, {
      role: 'Test Analyst',
      description: 'Testing multi-module integration',
      backstory: 'Test expert',
      thoughtModules: [
        { strategy: 'chain-of-thought', maxSteps: 2 },
        { strategy: 'reflection', maxSteps: 1 }
      ],
      katas: [{
        model: 'gpt-4o-mini',
        title: 'Test Specialist',
        description: 'Testing specialist'
      }]
    });

    const result = await shinobi.execute('Complex test query');
    
    expect(result.result.thoughtResults).toHaveLength(2);
    expect(result.result.enhancedReasoning).toBe(true);
  });
});
```

## 🚀 Advanced Migration Scenarios

### Scenario 1: Custom Thought Strategies

```typescript
// BEFORE: Custom strategy implementation
class CustomStrategy extends PromptStrategy {
  buildPrompt(input: string, context: any): string {
    return `Custom reasoning for: ${input}`;
  }
}

// AFTER: Configuration-based custom strategy
const customThoughtConfig = {
  strategy: 'custom',
  customPrompt: 'Custom reasoning for: {{input}}',
  maxSteps: 4,
  temperature: 0.8
};

const kata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Custom Reasoning Specialist',
  description: 'Uses custom reasoning approach',
  thoughtModule: customThoughtConfig
});
```

### Scenario 2: Complex Orchestration

```typescript
// BEFORE: Manual orchestration
const analysisModule = new ThoughtModule(analysisConfig, executor);
const synthesisModule = new ThoughtModule(synthesisConfig, executor);

const analysisResult = await analysisModule.think(context);
const synthesisContext = { ...context, analysis: analysisResult };
const finalResult = await synthesisModule.think(synthesisContext);

// AFTER: Dojo workflow
const dojo = new Dojo(runtime)
  .start(new Kata(runtime, {
    model: 'gpt-4o-mini',
    title: 'Analyst',
    description: 'Initial analysis',
    thoughtModule: analysisConfig
  }))
  .then(new Kata(runtime, {
    model: 'gpt-4o-mini',
    title: 'Synthesizer',
    description: 'Synthesis specialist',
    thoughtModule: synthesisConfig
  }));

const result = await dojo.execute(userQuery);
```

## ✅ Migration Verification

After migration, verify these points:

### 1. No Direct Imports
```bash
# Should return no results
grep -r "import.*ThoughtModule" src/
grep -r "import.*ThoughtRuntime" src/
grep -r "import.*PromptExecutor" src/
```

### 2. Proper Ninja Layer Usage
```bash
# Should show Ninja Layer imports
grep -r "import.*Shinobi" src/
grep -r "import.*Kata" src/
```

### 3. Configuration-Based Approach
```bash
# Should show thoughtModule configurations
grep -r "thoughtModule:" src/
grep -r "thoughtModules:" src/
```

### 4. Enhanced Results Access
```bash
# Should show proper result access patterns
grep -r "\.result\.thoughtResult" src/
grep -r "\.result\.enhancedReasoning" src/
```

## 🆘 Common Migration Issues

### Issue 1: "Cannot access ThoughtModule directly"

**Error:**
```
⚠️ ARCHITECTURAL VIOLATION: Direct Thought System Access
```

**Solution:**
Replace direct instantiation with Ninja Layer configuration:

```typescript
// ❌ Direct access
const thought = new ThoughtModule(config, executor);

// ✅ Ninja Layer access
const kata = new Kata(runtime, { thoughtModule: config });
```

### Issue 2: "Missing thought results"

**Error:**
```
Cannot read property 'thoughtResult' of undefined
```

**Solution:**
Access results through the enhanced result structure:

```typescript
// ❌ Old access pattern
const result = await thoughtModule.think(context);

// ✅ New access pattern
const kataResult = await kata.execute(query);
const thoughtResult = kataResult.result.thoughtResult;
```

### Issue 3: "Multiple modules not working"

**Solution:**
Use Shinobi for multiple thought modules:

```typescript
// ✅ Multiple modules through Shinobi
const shinobi = new Shinobi(runtime, {
  thoughtModules: [config1, config2, config3],
  // ... other config
});
```

## 📞 Getting Help

If you encounter issues during migration:

1. **Check the examples** in this guide
2. **Review the README** in `src/thought/README.md`
3. **Run the validation tests** to ensure proper migration
4. **Open an issue** if you need additional assistance

Remember: The architectural restrictions exist to maintain system integrity and security. Working within these boundaries ensures your implementation is robust and maintainable.