# Shuriken - AI Capabilities

Shurikens represent individual capabilities or functions that AI agents can invoke. They are the fundamental building blocks that enable AI agents to perform concrete actions beyond just generating text.

## 🎯 What is a Shuriken?

A Shuriken encapsulates:
- **Function Definition**: How the AI sees and calls the function
- **Parameter Validation**: Type-safe input validation using Zod schemas  
- **Implementation**: The actual code that performs the action
- **Execution Tracking**: Built-in performance and cost monitoring

Think of shurikens as tools in a craftsperson's toolkit—each designed for a specific purpose, reliable, and reusable across different projects.

## 🏗️ Anatomy of a Shuriken

```typescript
const calculatorShuriken = new Shuriken(
  'calculate',                    // 1. Function name (what AI calls)
  'Perform math calculations',    // 2. Description (helps AI decide when to use)
  z.object({                     // 3. Parameter schema (validation)
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  (params) => {                  // 4. Implementation (actual logic)
    switch (params.operation) {
      case 'add': return params.a + params.b;
      case 'subtract': return params.a - params.b;
      case 'multiply': return params.a * params.b;
      case 'divide': return params.b !== 0 ? params.a / params.b : 'Cannot divide by zero';
    }
  }
);
```

## 🔧 Creating Effective Shurikens

### 1. Clear Naming
The function name should be descriptive and follow conventions:

```typescript
// ✅ Good - Clear and specific
'get_weather'
'calculate_distance' 
'send_email'
'search_database'

// ❌ Avoid - Vague or generic
'do_something'
'helper'
'utility'
```

### 2. Descriptive Documentation
Help the AI understand when and how to use your shuriken:

```typescript
const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather conditions and forecast for any city worldwide. Includes temperature, humidity, wind speed, and 3-day forecast.',
  // ... schema and implementation
);
```

### 3. Robust Schema Design
Use Zod's powerful validation features:

```typescript
const emailSchema = z.object({
  to: z.string().email().describe('Recipient email address'),
  subject: z.string().min(1).max(200).describe('Email subject line'),
  body: z.string().min(1).describe('Email content'),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  attachments: z.array(z.string()).optional().describe('File paths for attachments')
});
```

### 4. Error Handling
Always handle errors gracefully:

```typescript
const apiShuriken = new Shuriken(
  'fetch_data',
  'Fetch data from external API',
  fetchSchema,
  async (params) => {
    try {
      const response = await fetch(params.url);
      if (!response.ok) {
        return { error: `API request failed: ${response.status} ${response.statusText}` };
      }
      return await response.json();
    } catch (error) {
      return { error: `Network error: ${error.message}` };
    }
  }
);
```

## 🎨 Common Shuriken Patterns

### 1. Data Retrieval
```typescript
const databaseShuriken = new Shuriken(
  'query_database',
  'Query the user database for specific information',
  z.object({
    table: z.string(),
    filters: z.record(z.any()).optional(),
    limit: z.number().max(100).default(10)
  }),
  async (params) => {
    // Database query logic
    return await db.query(params.table, params.filters, params.limit);
  }
);
```

### 2. External API Integration
```typescript
const translationShuriken = new Shuriken(
  'translate_text',
  'Translate text between different languages',
  z.object({
    text: z.string(),
    from: z.string().length(2).describe('Source language code (e.g., "en")'),
    to: z.string().length(2).describe('Target language code (e.g., "es")')
  }),
  async (params) => {
    const response = await translationAPI.translate(params);
    return {
      original: params.text,
      translated: response.translatedText,
      confidence: response.confidence
    };
  }
);
```

### 3. File Operations
```typescript
const fileShuriken = new Shuriken(
  'save_file',
  'Save content to a file on the filesystem',
  z.object({
    path: z.string().describe('File path where content should be saved'),
    content: z.string().describe('Content to write to the file'),
    encoding: z.enum(['utf8', 'base64']).default('utf8')
  }),
  async (params) => {
    await fs.writeFile(params.path, params.content, params.encoding);
    return {
      success: true,
      path: params.path,
      size: params.content.length
    };
  }
);
```

### 4. Calculations and Processing
```typescript
const statisticsShuriken = new Shuriken(
  'calculate_statistics',
  'Calculate statistical measures for a dataset',
  z.object({
    data: z.array(z.number()).min(1),
    measures: z.array(z.enum(['mean', 'median', 'mode', 'stddev'])).default(['mean'])
  }),
  (params) => {
    const results = {};
    if (params.measures.includes('mean')) {
      results.mean = params.data.reduce((a, b) => a + b) / params.data.length;
    }
    if (params.measures.includes('median')) {
      const sorted = [...params.data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      results.median = sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];
    }
    // ... other calculations
    return results;
  }
);
```

## 🔄 Shuriken Lifecycle

### 1. Creation
```typescript
const myShuriken = new Shuriken(name, description, schema, implementation);
```

### 2. Registration
```typescript
// Add to a Kata
kata.addShuriken(myShuriken);

// Or include in Shinobi configuration
const shinobi = new Shinobi(runtime, {
  // ...
  shurikens: [myShuriken, otherShuriken]
});
```

### 3. Forging (OpenAI Tool Definition)
```typescript
const toolDefinition = myShuriken.forge();
// Returns OpenAI-compatible function definition
```

### 4. Execution
```typescript
// Called automatically by AI or manually for testing
const result = await myShuriken.execute(parameters);
```

## 📊 Built-in Monitoring

Every shuriken execution is automatically tracked:

```typescript
const result = await shuriken.execute(params);
console.log(result);
// {
//   result: { /* your function's return value */ },
//   executionTime: 245, // milliseconds
//   shurikenId: "uuid-here"
// }
```

## 🧪 Testing Shurikens

### Unit Testing
```typescript
import { describe, it, expect } from 'vitest';

describe('Calculator Shuriken', () => {
  it('should add two numbers correctly', async () => {
    const result = await calculatorShuriken.execute({
      operation: 'add',
      a: 5,
      b: 3
    });
    
    expect(result.result).toBe(8);
    expect(result.executionTime).toBeGreaterThan(0);
  });

  it('should handle division by zero', async () => {
    const result = await calculatorShuriken.execute({
      operation: 'divide',
      a: 10,
      b: 0
    });
    
    expect(result.result).toBe('Cannot divide by zero');
  });
});
```

### Validation Testing
```typescript
it('should validate parameters correctly', () => {
  const validation = calculatorShuriken.validate({
    operation: 'invalid',
    a: 'not a number',
    b: 5
  });
  
  expect(validation.success).toBe(false);
  expect(validation.error).toContain('operation');
});
```

## 🎯 Best Practices

### 1. Single Responsibility
Each shuriken should do one thing well:

```typescript
// ✅ Good - Focused responsibility
const getCurrentWeather = new Shuriken(/* weather only */);
const getWeatherForecast = new Shuriken(/* forecast only */);

// ❌ Avoid - Too many responsibilities  
const weatherEverything = new Shuriken(/* weather + forecast + alerts + history */);
```

### 2. Consistent Return Formats
Establish patterns for your return values:

```typescript
// Success format
return {
  success: true,
  data: actualResult,
  metadata: { timestamp: new Date(), source: 'api' }
};

// Error format
return {
  success: false,
  error: 'Descriptive error message',
  code: 'ERROR_CODE'
};
```

### 3. Async When Needed
Use async functions for I/O operations:

```typescript
// ✅ Good - Async for I/O
const apiShuriken = new Shuriken(name, desc, schema, async (params) => {
  return await fetch(params.url);
});

// ✅ Good - Sync for pure functions
const mathShuriken = new Shuriken(name, desc, schema, (params) => {
  return params.a + params.b;
});
```

### 4. Descriptive Schemas
Use Zod's `.describe()` method extensively:

```typescript
z.object({
  city: z.string().describe('City name (e.g., "New York", "London")'),
  country: z.string().optional().describe('Country code (e.g., "US", "GB") - helps with disambiguation'),
  units: z.enum(['metric', 'imperial']).default('metric').describe('Temperature units')
})
```

## 🚀 Advanced Patterns

### Conditional Logic
```typescript
const smartShuriken = new Shuriken(
  'process_data',
  'Process data with different strategies based on input type',
  z.object({
    data: z.any(),
    strategy: z.enum(['fast', 'accurate', 'balanced']).default('balanced')
  }),
  (params) => {
    switch (params.strategy) {
      case 'fast': return fastProcessor(params.data);
      case 'accurate': return accurateProcessor(params.data);
      case 'balanced': return balancedProcessor(params.data);
    }
  }
);
```

### Chaining Operations
```typescript
const pipelineShuriken = new Shuriken(
  'data_pipeline',
  'Process data through multiple transformation steps',
  z.object({
    data: z.any(),
    steps: z.array(z.enum(['clean', 'transform', 'validate', 'enrich']))
  }),
  (params) => {
    let result = params.data;
    for (const step of params.steps) {
      result = processors[step](result);
    }
    return result;
  }
);
```

## 🔗 Integration with Katas

Shurikens become powerful when integrated with Katas:

```typescript
const dataAnalyst = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Data Analysis Specialist',
  description: 'Analyze datasets and provide insights',
  shurikens: [
    statisticsShuriken,
    visualizationShuriken,
    databaseShuriken
  ]
});

// The AI can now automatically use these capabilities
await dataAnalyst.execute('Analyze the sales data and create a summary report');
```

## 📚 Next Steps

Now that you understand shurikens, learn how to combine them into powerful workflows:

- **[Kata - AI Specialists](kata)** - Build agents that use your shurikens
- **[Creating Shurikens Guide](../guides/creating-shurikens)** - Detailed implementation guide
- **[Testing Strategies](../guides/testing-strategies)** - Comprehensive testing approaches