# 🥷 Ninja Layer - Enhanced AI Components

The Ninja Layer provides enhanced versions of core components with integrated Thought System capabilities. This layer serves as the primary user-facing API for advanced AI orchestration.

## 🏗️ Architecture Overview

```
User Code → Ninja Layer → Thought System → Scroll Layer → LLM Providers
```

The Ninja Layer acts as a controlled gateway to the Thought System, ensuring:
- **Security**: Proper access controls and validation
- **Abstraction**: Clean, user-friendly APIs
- **Enhancement**: Advanced reasoning capabilities
- **Integration**: Seamless thought process integration

## 🧩 Core Components

### 🥷 Enhanced Shinobi

Persona-driven orchestrators with advanced reasoning capabilities.

```typescript
import { Shinobi } from 'ninja-agents';

const advancedShinobi = new Shinobi(runtime, {
  role: 'Strategic Analyst',
  description: 'Multi-perspective strategic analysis',
  backstory: 'Expert in complex reasoning and analysis',
  
  // 🧠 Thought System Integration
  thoughtModules: [
    {
      strategy: 'chain-of-thought',
      maxSteps: 3,
      temperature: 0.6
    },
    {
      strategy: 'reflection',
      maxSteps: 2,
      temperature: 0.4
    }
  ],
  
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Analysis Specialist',
      description: 'Detailed analysis with reasoning',
      thoughtModule: {
        strategy: 'multi-perspective',
        perspectives: ['technical', 'business', 'user'],
        temperature: 0.7
      }
    }
  ]
});

// Execute with enhanced reasoning
const result = await advancedShinobi.execute('Analyze market trends');
console.log('Thought Results:', result.result.thoughtResults);
```

### 🥋 Enhanced Kata

Specialized AI agents with integrated reasoning modules.

```typescript
import { Kata } from 'ninja-agents';

const reasoningKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Problem Solver',
  description: 'Systematic problem solving with reasoning',
  
  // 🧠 Thought Module Integration
  thoughtModule: {
    strategy: 'step-by-step',
    maxSteps: 5,
    temperature: 0.5,
    validation: true
  },
  
  parameters: {
    temperature: 0.7,
    max_tokens: 1500
  }
});

const solution = await reasoningKata.execute('How can we optimize database performance?');
console.log('Reasoning Process:', solution.result.reasoning);
console.log('Final Solution:', solution.result.standardResult);
```

### 🏛️ Clan - Agent Networks

Coordinate multiple Shinobi with different execution strategies.

```typescript
import { Clan } from 'ninja-agents';

const analysisTeam = new Clan(runtime, {
  name: 'Market Analysis Team',
  description: 'Comprehensive market analysis from multiple perspectives',
  strategy: 'collaborative',
  shinobi: [
    technicalAnalystConfig,
    businessAnalystConfig,
    userResearcherConfig
  ]
});

const teamResult = await analysisTeam.execute('Analyze the competitive landscape');
```

### 🏯 Dojo - Workflow Orchestration

Create complex workflows with conditional branching and parallel execution.

```typescript
import { Dojo } from 'ninja-agents';

const analysisWorkflow = new Dojo(runtime)
  .start(dataCollector)
  .then(primaryAnalyst)
  .parallel([
    technicalReviewer,
    businessReviewer,
    userExperienceReviewer
  ])
  .if(needsDeepDive, deepAnalysisSpecialist)
  .then(synthesizer);

const workflowResult = await analysisWorkflow.execute('Comprehensive product analysis');
```

## 🧠 Thought System Integration

### Automatic Enhancement

When you configure `thoughtModule` or `thoughtModules`, the Ninja Layer automatically:

1. **Validates Configuration**: Ensures proper thought module setup
2. **Manages Context**: Handles thought context creation and management
3. **Orchestrates Execution**: Coordinates between standard and enhanced reasoning
4. **Synthesizes Results**: Combines thought results with standard outputs

### Enhanced Results Structure

```typescript
interface EnhancedResult {
  standardResult: string;           // Standard AI response
  thoughtResult?: any;              // Thought module output
  reasoning?: string;               // Reasoning process
  enhancedReasoning: boolean;       // Enhancement flag
  thoughtResults?: any[];           // Multiple thought results (Shinobi)
}
```

### Configuration Options

```typescript
interface ThoughtModuleConfig {
  strategy: 'chain-of-thought' | 'reflection' | 'multi-perspective' | 'step-by-step';
  maxSteps?: number;
  temperature?: number;
  validation?: boolean;
  perspectives?: string[];
  customPrompt?: string;
}
```

## 🔒 Security and Access Control

### Why Ninja Layer Only?

The Thought System is restricted to Ninja Layer access for several critical reasons:

1. **Security Boundaries**: Prevents unauthorized access to internal reasoning
2. **Context Management**: Ensures proper thought context handling
3. **Resource Control**: Manages computational resources effectively
4. **Quality Assurance**: Maintains consistent reasoning patterns

### Proper Usage Patterns

```typescript
// ✅ CORRECT: Through Ninja Layer
import { Shinobi, Kata } from 'ninja-agents';

const kata = new Kata(runtime, {
  thoughtModule: config  // ✅ Proper integration
});

// ❌ INCORRECT: Direct access
import { ThoughtModule } from 'ninja-agents';
const thought = new ThoughtModule(config, executor); // ❌ Violates architecture
```

## 📊 Performance and Monitoring

### Built-in Monitoring

The Ninja Layer provides comprehensive monitoring:

```typescript
const result = await shinobi.execute(query);

// Performance metrics
console.log('Execution Time:', result.executionTime);
console.log('Token Usage:', result.billingInfo?.tokenUsage);
console.log('Estimated Cost:', result.billingInfo?.estimatedCost);

// Enhancement metrics
console.log('Enhanced Reasoning:', result.result.enhancedReasoning);
console.log('Thought Modules Used:', result.result.thoughtResults?.length);
```

### Optimization Tips

1. **Choose Appropriate Strategies**: Match thought strategies to use cases
2. **Limit Steps**: Use reasonable `maxSteps` values to control costs
3. **Temperature Control**: Adjust temperature for consistency vs creativity
4. **Selective Enhancement**: Only use thought modules when needed

## 🧪 Testing Enhanced Components

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest';
import { Kata } from 'ninja-agents';

describe('Enhanced Kata', () => {
  it('should execute with thought module', async () => {
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
  });
});
```

### Integration Testing

```typescript
describe('Enhanced Shinobi', () => {
  it('should orchestrate multiple thought modules', async () => {
    const shinobi = new Shinobi(runtime, {
      role: 'Test Analyst',
      thoughtModules: [
        { strategy: 'chain-of-thought', maxSteps: 2 },
        { strategy: 'reflection', maxSteps: 1 }
      ],
      katas: [basicKataConfig]
    });

    const result = await shinobi.execute('Complex query');
    
    expect(result.result.thoughtResults).toHaveLength(2);
    expect(result.result.enhancedReasoning).toBe(true);
  });
});
```

## 🚀 Advanced Usage Patterns

### Multi-Modal Reasoning

```typescript
const multiModalShinobi = new Shinobi(runtime, {
  role: 'Multi-Modal Analyst',
  description: 'Combines different reasoning approaches',
  thoughtModules: [
    { strategy: 'chain-of-thought', maxSteps: 3 },
    { strategy: 'reflection', maxSteps: 2 },
    { strategy: 'multi-perspective', perspectives: ['technical', 'business'] }
  ],
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Synthesis Specialist',
      description: 'Synthesizes multi-modal reasoning'
    }
  ]
});
```

### Conditional Reasoning

```typescript
const adaptiveDojo = new Dojo(runtime)
  .start(initialAnalyst)
  .if(
    (context) => context.complexity > 0.8,
    new Kata(runtime, {
      thoughtModule: { strategy: 'chain-of-thought', maxSteps: 5 }
    })
  )
  .else(
    new Kata(runtime, {
      thoughtModule: { strategy: 'reflection', maxSteps: 2 }
    })
  );
```

### Collaborative Analysis

```typescript
const collaborativeClan = new Clan(runtime, {
  name: 'Collaborative Analysis Team',
  strategy: 'collaborative',
  shinobi: [
    {
      role: 'Technical Expert',
      thoughtModules: [{ strategy: 'step-by-step', maxSteps: 4 }],
      katas: [technicalKataConfig]
    },
    {
      role: 'Business Analyst',
      thoughtModules: [{ strategy: 'multi-perspective', perspectives: ['cost', 'benefit', 'risk'] }],
      katas: [businessKataConfig]
    }
  ]
});
```

## 📚 Best Practices

### 1. Strategy Selection

- **Chain-of-Thought**: For step-by-step reasoning
- **Reflection**: For self-correction and validation
- **Multi-Perspective**: For comprehensive analysis
- **Step-by-Step**: For systematic problem solving

### 2. Configuration Guidelines

```typescript
// ✅ Good: Balanced configuration
{
  strategy: 'chain-of-thought',
  maxSteps: 3,           // Reasonable limit
  temperature: 0.7,      // Balanced creativity
  validation: true       // Quality control
}

// ❌ Avoid: Excessive configuration
{
  strategy: 'chain-of-thought',
  maxSteps: 20,          // Too many steps
  temperature: 1.5,      // Too random
  validation: false      // No quality control
}
```

### 3. Error Handling

```typescript
try {
  const result = await kata.execute(userQuery);
  
  if (result.result.enhancedReasoning) {
    // Handle enhanced results
    processThoughtResult(result.result.thoughtResult);
  }
  
  processStandardResult(result.result.standardResult);
  
} catch (error) {
  console.error('Enhanced execution failed:', error.message);
  // Fallback to standard processing
}
```

### 4. Resource Management

```typescript
// Monitor and control resource usage
const result = await kata.execute(query);

if (result.billingInfo?.estimatedCost > threshold) {
  console.warn('High cost execution detected');
  // Implement cost controls
}
```

## 🔗 Related Documentation

- **[Thought System Overview](../thought/README.md)** - Understanding the reasoning engine
- **[Migration Guide](../thought/MIGRATION.md)** - Migrating from direct access
- **[Security Guidelines](../thought/SECURITY.md)** - Security best practices
- **[Core Components](../core/README.md)** - Base component documentation

The Ninja Layer provides the perfect balance of power and simplicity, giving you access to advanced AI reasoning capabilities while maintaining security, performance, and ease of use.