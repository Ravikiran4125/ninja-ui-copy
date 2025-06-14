# Best Practices Guide - Ninja Agents SDK

This guide provides comprehensive best practices for implementing, optimizing, and scaling applications built with the Ninja Agents SDK.

## 🏗️ Architecture Best Practices

### 1. Component Organization

#### Modular Design
```typescript
// ✅ Good: Separate concerns clearly
// shurikens/weatherShuriken.ts
export const weatherShuriken = new Shuriken(/* weather-specific logic */);

// katas/weatherAnalyst.ts
export const weatherAnalyst = new Kata(/* weather analysis logic */);

// shinobi/travelExpert.ts
export const travelExpert = new Shinobi(/* travel expertise orchestration */);
```

#### Avoid Monolithic Agents
```typescript
// ❌ Bad: Single agent doing everything
const megaAgent = new Shinobi(runtime, {
  role: 'Everything Expert',
  katas: [
    weatherKata, financeKata, travelKata, cookingKata, 
    programmingKata, medicalKata, legalKata // Too many responsibilities
  ]
});

// ✅ Good: Focused, specialized agents
const travelExpert = new Shinobi(runtime, {
  role: 'Travel Expert',
  katas: [weatherKata, destinationKata, costKata] // Related responsibilities
});

const financeExpert = new Shinobi(runtime, {
  role: 'Finance Expert', 
  katas: [budgetKata, investmentKata, taxKata] // Related responsibilities
});
```

### 2. Configuration Management

#### Environment-Based Configuration
```typescript
// config/environments.ts
export const environments = {
  development: {
    openai: {
      model: 'gpt-4o-mini', // Cheaper for development
      temperature: 0.8,
      maxTokens: 1000
    },
    memory: {
      enableDatabaseLogging: false,
      enableFileLogging: true
    }
  },
  production: {
    openai: {
      model: 'gpt-4o', // More capable for production
      temperature: 0.7,
      maxTokens: 2000
    },
    memory: {
      enableDatabaseLogging: true,
      enableFileLogging: false
    }
  }
};
```

#### Configuration Validation
```typescript
// config/validation.ts
import { z } from 'zod';

const configSchema = z.object({
  openai: z.object({
    apiKey: z.string().min(1),
    model: z.enum(['gpt-4o', 'gpt-4o-mini']),
    temperature: z.number().min(0).max(2)
  }),
  supabase: z.object({
    url: z.string().url().optional(),
    key: z.string().optional()
  }).optional()
});

export function validateConfig(config: unknown) {
  return configSchema.parse(config);
}
```

## 🚀 Performance Optimization

### 1. Efficient Resource Usage

#### Model Selection Strategy
```typescript
// ✅ Good: Use appropriate models for different tasks
const quickTasks = new Kata(runtime, {
  model: 'gpt-4o-mini', // Fast and cost-effective
  title: 'Quick Summarizer',
  description: 'Fast text summarization'
});

const complexTasks = new Kata(runtime, {
  model: 'gpt-4o', // More capable for complex reasoning
  title: 'Deep Analyst',
  description: 'Complex analysis and reasoning'
});

// Conditional model selection
const adaptiveKata = new Kata(runtime, {
  model: complexity > 0.8 ? 'gpt-4o' : 'gpt-4o-mini',
  title: 'Adaptive Processor',
  description: 'Adapts model based on complexity'
});
```

#### Parallel Execution Optimization
```typescript
// ✅ Good: Use Clan for independent parallel tasks
const parallelAnalysis = new Clan(runtime, {
  name: 'Parallel Analysis Team',
  strategy: 'parallel',
  shinobi: [technicalAnalyst, marketAnalyst, userAnalyst],
  maxConcurrency: 3 // Limit concurrent executions
});

// ✅ Good: Use Dojo for dependent sequential tasks
const sequentialWorkflow = new Dojo(runtime)
  .start(dataCollector)
  .then(analyzer)
  .then(synthesizer);
```

#### Memory and Caching
```typescript
// ✅ Good: Implement result caching
class CachedShuriken extends Shuriken {
  private cache = new Map<string, any>();
  
  async execute(parameters: any) {
    const key = JSON.stringify(parameters);
    
    if (this.cache.has(key)) {
      return { 
        result: this.cache.get(key), 
        executionTime: 0,
        cached: true 
      };
    }
    
    const result = await super.execute(parameters);
    this.cache.set(key, result.result);
    return result;
  }
}
```

### 2. Token Optimization

#### Prompt Engineering
```typescript
// ❌ Bad: Verbose, inefficient prompts
const verboseKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Verbose Analyst',
  description: 'Please analyze this data very thoroughly and provide a comprehensive analysis with detailed explanations, multiple perspectives, extensive background information, and complete documentation of your reasoning process...'
});

// ✅ Good: Concise, focused prompts
const efficientKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Efficient Analyst',
  description: 'Analyze data and provide key insights with supporting evidence'
});
```

#### Parameter Optimization
```typescript
// ✅ Good: Optimize parameters for efficiency
const optimizedKata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Optimized Processor',
  description: 'Process requests efficiently',
  parameters: {
    temperature: 0.3, // Lower for consistent, focused responses
    max_tokens: 500,  // Limit tokens for cost control
    top_p: 0.9,       // Focus on high-probability tokens
    frequency_penalty: 0.1 // Reduce repetition
  }
});
```

## 🔒 Security Best Practices

### 1. API Key Management

#### Secure Storage
```typescript
// ✅ Good: Use environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ Good: Validate API key presence
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// ❌ Bad: Hardcoded API keys
const openai = new OpenAI({
  apiKey: 'sk-1234567890abcdef' // Never do this!
});
```

#### Key Rotation
```typescript
// ✅ Good: Support key rotation
class SecureOpenAIClient {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: this.getCurrentApiKey()
    });
  }
  
  private getCurrentApiKey(): string {
    // Implement key rotation logic
    return process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_BACKUP;
  }
  
  async refreshKey(): Promise<void> {
    this.client = new OpenAI({
      apiKey: this.getCurrentApiKey()
    });
  }
}
```

### 2. Input Validation and Sanitization

#### Comprehensive Validation
```typescript
// ✅ Good: Strict input validation
const secureShuriken = new Shuriken(
  'secure_processor',
  'Securely process user input',
  z.object({
    input: z.string()
      .min(1, 'Input cannot be empty')
      .max(10000, 'Input too long')
      .refine(input => !containsMaliciousContent(input), 'Invalid input detected'),
    type: z.enum(['text', 'query', 'command']),
    userId: z.string().uuid('Invalid user ID format')
  }),
  async (params) => {
    // Additional runtime validation
    if (await isUserAuthorized(params.userId)) {
      return await processSecurely(params.input);
    }
    throw new Error('Unauthorized access');
  }
);

function containsMaliciousContent(input: string): boolean {
  const maliciousPatterns = [
    /script\s*:/i,
    /javascript\s*:/i,
    /data\s*:/i,
    /<script/i,
    /eval\s*\(/i
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(input));
}
```

#### Rate Limiting
```typescript
// ✅ Good: Implement rate limiting
class RateLimitedRuntime extends KataRuntime {
  private requestCounts = new Map<string, number>();
  private readonly maxRequestsPerMinute = 60;
  
  async execute(userId: string, agent: Shinobi, query: string) {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }
    
    return await agent.execute(query);
  }
  
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    // Clean old entries
    this.requestCounts.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        this.requestCounts.delete(key);
      }
    });
    
    const userRequests = Array.from(this.requestCounts.entries())
      .filter(([key]) => key.startsWith(userId))
      .length;
    
    if (userRequests >= this.maxRequestsPerMinute) {
      return false;
    }
    
    this.requestCounts.set(`${userId}-${now}`, now);
    return true;
  }
}
```

### 3. Data Privacy

#### Sensitive Data Handling
```typescript
// ✅ Good: Sanitize sensitive data
class PrivacyAwareMemory extends Memory {
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string> {
    // Remove sensitive information before logging
    const sanitizedEntry = {
      ...entry,
      message: this.sanitizeMessage(entry.message),
      metadata: this.sanitizeMetadata(entry.metadata)
    };
    
    return super.log(sanitizedEntry);
  }
  
  private sanitizeMessage(message: string): string {
    // Remove email addresses, phone numbers, etc.
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
  }
  
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return metadata;
    
    const sanitized = { ...metadata };
    const sensitiveKeys = ['password', 'token', 'key', 'secret'];
    
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

## 📊 Monitoring and Analytics

### 1. Performance Monitoring

#### Execution Metrics
```typescript
// ✅ Good: Comprehensive performance monitoring
class MonitoredShinobi extends Shinobi {
  async execute(userQuery: string) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await super.execute(userQuery);
      
      // Log performance metrics
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      
      await this.logPerformanceMetrics({
        executionTime: endTime - startTime,
        memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
        tokenUsage: result.billingInfo?.tokenUsage,
        cost: result.billingInfo?.estimatedCost,
        success: true
      });
      
      return result;
    } catch (error) {
      await this.logPerformanceMetrics({
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
      throw error;
    }
  }
  
  private async logPerformanceMetrics(metrics: any) {
    // Send to monitoring service
    await this.runtime.logger.info('Performance metrics', metrics);
  }
}
```

#### Health Checks
```typescript
// ✅ Good: Implement health checks
export class HealthChecker {
  constructor(private runtime: KataRuntime) {}
  
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkOpenAIConnection(),
      this.checkMemorySystem(),
      this.checkSystemResources()
    ]);
    
    return {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: {
        openai: checks[0].status === 'fulfilled',
        memory: checks[1].status === 'fulfilled',
        resources: checks[2].status === 'fulfilled'
      },
      timestamp: new Date()
    };
  }
  
  private async checkOpenAIConnection(): Promise<boolean> {
    try {
      await this.runtime.openai.models.list();
      return true;
    } catch {
      return false;
    }
  }
  
  private async checkMemorySystem(): Promise<boolean> {
    try {
      if (this.runtime.memory) {
        await this.runtime.memory.log({
          level: 'debug',
          message: 'Health check'
        });
      }
      return true;
    } catch {
      return false;
    }
  }
  
  private async checkSystemResources(): Promise<boolean> {
    const usage = process.memoryUsage();
    const memoryUsagePercent = usage.heapUsed / usage.heapTotal;
    return memoryUsagePercent < 0.9; // Less than 90% memory usage
  }
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: Date;
}
```

### 2. Cost Monitoring

#### Budget Controls
```typescript
// ✅ Good: Implement cost controls
class BudgetAwareRuntime extends KataRuntime {
  private dailySpend = 0;
  private readonly dailyBudget = 100; // $100 daily budget
  
  async execute(agent: Shinobi, query: string) {
    if (this.dailySpend >= this.dailyBudget) {
      throw new Error('Daily budget exceeded');
    }
    
    const result = await agent.execute(query);
    
    if (result.billingInfo) {
      this.dailySpend += result.billingInfo.estimatedCost;
      
      // Alert when approaching budget
      if (this.dailySpend > this.dailyBudget * 0.8) {
        await this.sendBudgetAlert();
      }
    }
    
    return result;
  }
  
  private async sendBudgetAlert() {
    await this.logger.warn('Approaching daily budget limit', {
      currentSpend: this.dailySpend,
      budget: this.dailyBudget,
      percentage: (this.dailySpend / this.dailyBudget) * 100
    });
  }
}
```

## 🧪 Testing Best Practices

### 1. Unit Testing

#### Comprehensive Test Coverage
```typescript
// ✅ Good: Thorough unit tests
describe('WeatherShuriken', () => {
  let weatherShuriken: Shuriken;
  
  beforeEach(() => {
    weatherShuriken = new Shuriken(
      'get_weather',
      'Get weather information',
      z.object({
        city: z.string(),
        unit: z.enum(['celsius', 'fahrenheit']).optional()
      }),
      mockWeatherImplementation
    );
  });
  
  describe('validation', () => {
    it('should validate correct parameters', () => {
      const result = weatherShuriken.validate({ city: 'Paris' });
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid parameters', () => {
      const result = weatherShuriken.validate({ city: 123 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('city');
    });
    
    it('should handle optional parameters', () => {
      const result = weatherShuriken.validate({ 
        city: 'Paris', 
        unit: 'celsius' 
      });
      expect(result.success).toBe(true);
    });
  });
  
  describe('execution', () => {
    it('should execute successfully with valid parameters', async () => {
      const result = await weatherShuriken.execute({ city: 'Paris' });
      expect(result.result).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });
    
    it('should handle execution errors gracefully', async () => {
      const errorShuriken = new Shuriken(
        'error_test',
        'Test error handling',
        z.object({ input: z.string() }),
        () => { throw new Error('Test error'); }
      );
      
      await expect(errorShuriken.execute({ input: 'test' }))
        .rejects.toThrow('Test error');
    });
  });
});
```

### 2. Integration Testing

#### End-to-End Workflows
```typescript
// ✅ Good: Integration tests for complete workflows
describe('Travel Planning Workflow', () => {
  let runtime: KataRuntime;
  let travelExpert: Shinobi;
  
  beforeEach(async () => {
    runtime = await createTestRuntime();
    travelExpert = new Shinobi(runtime, travelExpertConfig);
  });
  
  it('should complete full travel planning workflow', async () => {
    const query = 'Plan a 3-day trip to Tokyo in spring';
    const result = await travelExpert.execute(query);
    
    expect(result.result.finalAnswer).toBeDefined();
    expect(result.result.kataResults).toHaveLength(3);
    expect(result.billingInfo?.estimatedCost).toBeLessThan(1.0);
  });
  
  it('should handle complex multi-agent collaboration', async () => {
    const clan = new Clan(runtime, {
      name: 'Travel Planning Team',
      strategy: 'collaborative',
      shinobi: [travelExpert, budgetExpert, weatherExpert]
    });
    
    const result = await clan.execute('Plan a budget trip to Europe');
    
    expect(result.result.strategy).toBe('collaborative');
    expect(result.result.results).toHaveLength(3);
    expect(result.result.synthesis).toBeDefined();
  });
});
```

### 3. Performance Testing

#### Load Testing
```typescript
// ✅ Good: Performance and load tests
describe('Performance Tests', () => {
  it('should handle concurrent executions efficiently', async () => {
    const runtime = await createTestRuntime();
    const kata = new Kata(runtime, simpleKataConfig);
    
    const concurrentExecutions = 10;
    const promises = Array.from({ length: concurrentExecutions }, () =>
      kata.execute('Simple test query')
    );
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    expect(results).toHaveLength(concurrentExecutions);
    expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
    
    results.forEach(result => {
      expect(result.result).toBeDefined();
      expect(result.executionTime).toBeLessThan(10000); // Each execution < 10 seconds
    });
  });
  
  it('should maintain performance under memory pressure', async () => {
    const runtime = await createTestRuntime();
    const memoryIntensiveKata = new Kata(runtime, memoryIntensiveConfig);
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Execute multiple times to test memory management
    for (let i = 0; i < 50; i++) {
      await memoryIntensiveKata.execute(`Test query ${i}`);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
  });
});
```

## 🔄 Error Handling and Resilience

### 1. Graceful Error Handling

#### Comprehensive Error Management
```typescript
// ✅ Good: Robust error handling
class ResilientShinobi extends Shinobi {
  async execute(userQuery: string, options: ExecutionOptions = {}) {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await super.execute(userQuery);
      } catch (error) {
        const isRetryable = this.isRetryableError(error);
        
        if (attempt === maxRetries || !isRetryable) {
          await this.handleFinalError(error, attempt);
          throw error;
        }
        
        await this.handleRetryableError(error, attempt, maxRetries);
        await this.delay(retryDelay * attempt); // Exponential backoff
      }
    }
  }
  
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      // Retry on network errors, rate limits, temporary failures
      return error.message.includes('network') ||
             error.message.includes('timeout') ||
             error.message.includes('rate limit') ||
             error.message.includes('temporary');
    }
    return false;
  }
  
  private async handleRetryableError(error: unknown, attempt: number, maxRetries: number) {
    await this.runtime.logger.warn('Retryable error occurred', {
      error: error instanceof Error ? error.message : 'Unknown error',
      attempt,
      maxRetries,
      willRetry: attempt < maxRetries
    });
  }
  
  private async handleFinalError(error: unknown, attempts: number) {
    await this.runtime.logger.error('Final error after retries', {
      error: error instanceof Error ? error.message : 'Unknown error',
      totalAttempts: attempts
    });
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface ExecutionOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}
```

### 2. Circuit Breaker Pattern

#### Prevent Cascading Failures
```typescript
// ✅ Good: Circuit breaker implementation
class CircuitBreakerRuntime extends KataRuntime {
  private circuitBreaker = new Map<string, CircuitBreakerState>();
  
  async executeWithCircuitBreaker(
    serviceId: string, 
    operation: () => Promise<any>
  ): Promise<any> {
    const state = this.getCircuitBreakerState(serviceId);
    
    if (state.state === 'OPEN') {
      if (Date.now() - state.lastFailureTime < state.timeout) {
        throw new Error(`Circuit breaker OPEN for ${serviceId}`);
      }
      // Try to transition to HALF_OPEN
      state.state = 'HALF_OPEN';
    }
    
    try {
      const result = await operation();
      
      if (state.state === 'HALF_OPEN') {
        state.state = 'CLOSED';
        state.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      state.failureCount++;
      state.lastFailureTime = Date.now();
      
      if (state.failureCount >= state.threshold) {
        state.state = 'OPEN';
      }
      
      throw error;
    }
  }
  
  private getCircuitBreakerState(serviceId: string): CircuitBreakerState {
    if (!this.circuitBreaker.has(serviceId)) {
      this.circuitBreaker.set(serviceId, {
        state: 'CLOSED',
        failureCount: 0,
        threshold: 5,
        timeout: 60000, // 1 minute
        lastFailureTime: 0
      });
    }
    return this.circuitBreaker.get(serviceId)!;
  }
}

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  threshold: number;
  timeout: number;
  lastFailureTime: number;
}
```

## 📈 Scaling Considerations

### 1. Horizontal Scaling

#### Stateless Design
```typescript
// ✅ Good: Stateless agent design
class StatelessShinobi extends Shinobi {
  // No instance state that persists between requests
  
  async execute(userQuery: string, context?: ExecutionContext) {
    // All state passed as parameters or retrieved from external storage
    const sessionData = context?.sessionId 
      ? await this.getSessionData(context.sessionId)
      : {};
    
    const result = await super.execute(userQuery);
    
    // Store any state externally
    if (context?.sessionId) {
      await this.saveSessionData(context.sessionId, {
        ...sessionData,
        lastQuery: userQuery,
        lastResult: result.result.finalAnswer
      });
    }
    
    return result;
  }
  
  private async getSessionData(sessionId: string): Promise<any> {
    // Retrieve from external storage (Redis, database, etc.)
    return await this.runtime.memory?.queryLogs({ 
      metadata: { sessionId } 
    });
  }
  
  private async saveSessionData(sessionId: string, data: any): Promise<void> {
    // Save to external storage
    await this.runtime.memory?.log({
      level: 'info',
      message: 'Session data updated',
      metadata: { sessionId, data }
    });
  }
}

interface ExecutionContext {
  sessionId?: string;
  userId?: string;
  requestId?: string;
}
```

#### Load Balancing
```typescript
// ✅ Good: Load balancer for multiple runtime instances
class LoadBalancedRuntimeManager {
  private runtimes: KataRuntime[] = [];
  private currentIndex = 0;
  
  constructor(private config: RuntimeConfig[]) {
    this.initializeRuntimes();
  }
  
  private initializeRuntimes() {
    this.runtimes = this.config.map(config => 
      new KataRuntime(
        new OpenAI({ apiKey: config.apiKey }),
        new Logger(config.logLevel, config.context),
        new Memory(config.memoryConfig)
      )
    );
  }
  
  getRuntime(): KataRuntime {
    // Round-robin load balancing
    const runtime = this.runtimes[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.runtimes.length;
    return runtime;
  }
  
  async executeWithLoadBalancing(
    agentFactory: (runtime: KataRuntime) => Shinobi,
    query: string
  ) {
    const runtime = this.getRuntime();
    const agent = agentFactory(runtime);
    return await agent.execute(query);
  }
}
```

### 2. Vertical Scaling

#### Resource Optimization
```typescript
// ✅ Good: Resource-aware execution
class ResourceAwareRuntime extends KataRuntime {
  private readonly maxConcurrentExecutions: number;
  private currentExecutions = 0;
  private executionQueue: Array<() => Promise<any>> = [];
  
  constructor(
    openai: OpenAI,
    logger: Logger,
    memory?: Memory,
    maxConcurrentExecutions = 10
  ) {
    super(openai, logger, memory);
    this.maxConcurrentExecutions = maxConcurrentExecutions;
  }
  
  async executeWithResourceControl<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    if (this.currentExecutions >= this.maxConcurrentExecutions) {
      // Queue the operation
      return new Promise((resolve, reject) => {
        this.executionQueue.push(async () => {
          try {
            const result = await this.executeOperation(operation);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    
    return await this.executeOperation(operation);
  }
  
  private async executeOperation<T>(operation: () => Promise<T>): Promise<T> {
    this.currentExecutions++;
    
    try {
      const result = await operation();
      return result;
    } finally {
      this.currentExecutions--;
      
      // Process next item in queue
      if (this.executionQueue.length > 0) {
        const nextOperation = this.executionQueue.shift()!;
        setImmediate(() => nextOperation());
      }
    }
  }
}
```

## 🔧 Maintenance and Updates

### 1. Version Management

#### Backward Compatibility
```typescript
// ✅ Good: Version-aware configuration
class VersionAwareConfig {
  static migrate(config: any, fromVersion: string, toVersion: string): any {
    const migrations = {
      '0.9.0->1.0.0': this.migrateFrom09To10,
      '1.0.0->1.1.0': this.migrateFrom10To11
    };
    
    const migrationKey = `${fromVersion}->${toVersion}`;
    const migration = migrations[migrationKey];
    
    if (migration) {
      return migration(config);
    }
    
    return config;
  }
  
  private static migrateFrom09To10(config: any): any {
    // Handle breaking changes from 0.9.x to 1.0.0
    return {
      ...config,
      role: config.name, // 'name' became 'role'
      backstory: config.backstory || 'Migrated from previous version'
    };
  }
}
```

### 2. Health Monitoring

#### Automated Health Checks
```typescript
// ✅ Good: Continuous health monitoring
class HealthMonitor {
  private healthCheckInterval: NodeJS.Timeout;
  
  constructor(
    private runtime: KataRuntime,
    private checkIntervalMs = 60000 // 1 minute
  ) {
    this.startHealthChecks();
  }
  
  private startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        await this.handleHealthCheckFailure(error);
      }
    }, this.checkIntervalMs);
  }
  
  private async performHealthCheck() {
    const checks = await Promise.allSettled([
      this.checkOpenAIHealth(),
      this.checkMemoryHealth(),
      this.checkSystemHealth()
    ]);
    
    const failedChecks = checks
      .map((check, index) => ({ check, index }))
      .filter(({ check }) => check.status === 'rejected');
    
    if (failedChecks.length > 0) {
      await this.runtime.logger.warn('Health check failures detected', {
        failedChecks: failedChecks.map(({ index }) => 
          ['openai', 'memory', 'system'][index]
        )
      });
    }
  }
  
  private async checkOpenAIHealth(): Promise<void> {
    await this.runtime.openai.models.list();
  }
  
  private async checkMemoryHealth(): Promise<void> {
    if (this.runtime.memory) {
      await this.runtime.memory.log({
        level: 'debug',
        message: 'Health check ping'
      });
    }
  }
  
  private async checkSystemHealth(): Promise<void> {
    const usage = process.memoryUsage();
    const memoryUsagePercent = usage.heapUsed / usage.heapTotal;
    
    if (memoryUsagePercent > 0.9) {
      throw new Error(`High memory usage: ${(memoryUsagePercent * 100).toFixed(1)}%`);
    }
  }
  
  private async handleHealthCheckFailure(error: unknown) {
    await this.runtime.logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Implement alerting, auto-recovery, etc.
  }
  
  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
```

## 📚 Documentation Best Practices

### 1. Code Documentation

#### Comprehensive JSDoc
```typescript
/**
 * Advanced weather analysis agent with predictive capabilities.
 * 
 * This Shinobi specializes in weather analysis and provides detailed
 * forecasts with travel recommendations based on weather conditions.
 * 
 * @example
 * ```typescript
 * const weatherExpert = new WeatherExpertShinobi(runtime);
 * const analysis = await weatherExpert.execute(
 *   'What will the weather be like in Paris next week?'
 * );
 * console.log(analysis.result.finalAnswer);
 * ```
 * 
 * @since 1.0.0
 */
export class WeatherExpertShinobi extends Shinobi {
  /**
   * Creates a new WeatherExpertShinobi instance.
   * 
   * @param runtime - The KataRuntime providing dependencies
   * @param options - Optional configuration overrides
   * 
   * @throws {Error} When runtime is not properly configured
   */
  constructor(runtime: KataRuntime, options?: WeatherExpertOptions) {
    super(runtime, {
      role: 'Weather Analysis Expert',
      description: 'Advanced weather analysis and forecasting specialist',
      backstory: 'Meteorologist with 15+ years of experience...',
      katas: [
        // ... kata configurations
      ]
    });
  }
}
```

### 2. Usage Examples

#### Comprehensive Examples
```typescript
// examples/weather-analysis.ts

/**
 * Complete example of weather analysis workflow
 * 
 * This example demonstrates:
 * - Setting up the runtime
 * - Creating a weather expert agent
 * - Executing weather analysis
 * - Handling results and errors
 */

import { WeatherExpertShinobi } from '../src/agents/WeatherExpertShinobi';
import { createRuntime } from '../src/utils/runtime';

async function main() {
  try {
    // 1. Initialize runtime
    const runtime = await createRuntime({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      enableLogging: true
    });
    
    // 2. Create weather expert
    const weatherExpert = new WeatherExpertShinobi(runtime);
    
    // 3. Execute analysis
    const result = await weatherExpert.execute(
      'Analyze the weather forecast for Tokyo next week and provide travel recommendations'
    );
    
    // 4. Process results
    console.log('Weather Analysis:', result.result.finalAnswer);
    console.log('Cost:', `$${result.billingInfo?.estimatedCost.toFixed(6)}`);
    console.log('Execution Time:', `${result.executionTime}ms`);
    
  } catch (error) {
    console.error('Weather analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
```

This comprehensive best practices guide covers all aspects of building production-ready applications with the Ninja Agents SDK. Following these practices will help you create efficient, secure, scalable, and maintainable AI agent systems.