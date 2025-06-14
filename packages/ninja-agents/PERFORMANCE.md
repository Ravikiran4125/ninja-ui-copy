# Performance Optimization Guide - Ninja Agents SDK

This guide provides comprehensive strategies for optimizing performance when building applications with the Ninja Agents SDK.

## 🎯 Performance Overview

The Ninja Agents SDK is designed for high-performance AI orchestration, but optimal performance requires careful consideration of model selection, resource management, and architectural decisions.

### Key Performance Metrics

1. **Execution Time**: Time to complete agent workflows
2. **Token Efficiency**: Optimal token usage for cost and speed
3. **Memory Usage**: RAM consumption during execution
4. **Throughput**: Requests processed per second
5. **Cost Efficiency**: Cost per successful execution

## 🚀 Model Selection and Configuration

### 1. Strategic Model Selection

#### Model Performance Characteristics
```typescript
// Performance-optimized model selection
const modelPerformanceMap = {
  'gpt-4o-mini': {
    speed: 'fast',
    cost: 'low',
    capability: 'good',
    useCase: 'Simple tasks, high volume'
  },
  'gpt-4o': {
    speed: 'medium',
    cost: 'medium',
    capability: 'excellent',
    useCase: 'Complex reasoning, quality critical'
  }
};

// ✅ Good: Use appropriate models for different tasks
class PerformanceOptimizedKata extends Kata {
  constructor(runtime: KataRuntime, config: KataConfig & { complexity?: number }) {
    const optimizedConfig = {
      ...config,
      model: config.complexity && config.complexity > 0.7 ? 'gpt-4o' : 'gpt-4o-mini'
    };
    
    super(runtime, optimizedConfig);
  }
}
```

#### Dynamic Model Selection
```typescript
class AdaptiveModelSelector {
  static selectModel(task: TaskAnalysis): string {
    const { complexity, urgency, budget } = task;
    
    // High urgency, simple task
    if (urgency === 'high' && complexity < 0.5) {
      return 'gpt-4o-mini';
    }
    
    // Complex task requiring high quality
    if (complexity > 0.8) {
      return 'gpt-4o';
    }
    
    // Budget-conscious selection
    if (budget === 'low') {
      return 'gpt-4o-mini';
    }
    
    // Default balanced choice
    return 'gpt-4o-mini';
  }
  
  static analyzeTask(query: string): TaskAnalysis {
    const complexity = this.calculateComplexity(query);
    const urgency = this.determineUrgency(query);
    const budget = 'medium'; // Could be determined by user tier
    
    return { complexity, urgency, budget };
  }
  
  private static calculateComplexity(query: string): number {
    const complexityIndicators = [
      /analyze|analysis|complex|detailed|comprehensive/i,
      /compare|contrast|evaluate|assess/i,
      /multiple|several|various|different/i,
      /step.?by.?step|process|procedure/i
    ];
    
    const matches = complexityIndicators.filter(pattern => pattern.test(query)).length;
    return Math.min(matches / complexityIndicators.length, 1);
  }
  
  private static determineUrgency(query: string): 'low' | 'medium' | 'high' {
    if (/urgent|asap|immediately|quickly/i.test(query)) return 'high';
    if (/soon|fast|rapid/i.test(query)) return 'medium';
    return 'low';
  }
}

interface TaskAnalysis {
  complexity: number;
  urgency: 'low' | 'medium' | 'high';
  budget: 'low' | 'medium' | 'high';
}
```

### 2. Parameter Optimization

#### Optimized Parameter Sets
```typescript
// Performance-optimized parameter configurations
const parameterProfiles = {
  speed: {
    temperature: 0.3,
    max_tokens: 500,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  },
  quality: {
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.95,
    frequency_penalty: 0.0,
    presence_penalty: 0.0
  },
  balanced: {
    temperature: 0.5,
    max_tokens: 1000,
    top_p: 0.9,
    frequency_penalty: 0.05,
    presence_penalty: 0.05
  },
  cost_optimized: {
    temperature: 0.3,
    max_tokens: 300,
    top_p: 0.8,
    frequency_penalty: 0.2,
    presence_penalty: 0.1
  }
};

class OptimizedKata extends Kata {
  constructor(
    runtime: KataRuntime, 
    config: KataConfig & { profile?: keyof typeof parameterProfiles }
  ) {
    const profile = config.profile || 'balanced';
    const optimizedConfig = {
      ...config,
      parameters: {
        ...parameterProfiles[profile],
        ...config.parameters // Allow overrides
      }
    };
    
    super(runtime, optimizedConfig);
  }
}
```

## ⚡ Execution Optimization

### 1. Parallel Execution Strategies

#### Optimal Clan Configuration
```typescript
// ✅ Good: Optimized parallel execution
class PerformanceOptimizedClan extends Clan {
  constructor(runtime: KataRuntime, config: ClanConfig) {
    // Optimize concurrency based on system resources
    const optimalConcurrency = this.calculateOptimalConcurrency();
    
    const optimizedConfig = {
      ...config,
      maxConcurrency: Math.min(config.maxConcurrency || 5, optimalConcurrency),
      timeout: config.timeout || 60000
    };
    
    super(runtime, optimizedConfig);
  }
  
  private calculateOptimalConcurrency(): number {
    const availableMemory = this.getAvailableMemory();
    const cpuCores = require('os').cpus().length;
    
    // Conservative estimate: 1 concurrent execution per 512MB RAM
    const memoryBasedLimit = Math.floor(availableMemory / (512 * 1024 * 1024));
    
    // Use CPU cores as upper bound
    return Math.min(memoryBasedLimit, cpuCores * 2);
  }
  
  private getAvailableMemory(): number {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    return totalMemory - usage.heapUsed;
  }
}
```

#### Smart Work Distribution
```typescript
class WorkloadBalancer {
  static async distributeWork<T>(
    tasks: T[],
    processor: (task: T) => Promise<any>,
    maxConcurrency = 5
  ): Promise<any[]> {
    const results: any[] = [];
    const executing: Promise<any>[] = [];
    
    for (const task of tasks) {
      // Wait if we've reached max concurrency
      if (executing.length >= maxConcurrency) {
        const completed = await Promise.race(executing);
        const index = executing.findIndex(p => p === completed);
        executing.splice(index, 1);
        results.push(await completed);
      }
      
      // Start new task
      const promise = processor(task);
      executing.push(promise);
    }
    
    // Wait for remaining tasks
    const remaining = await Promise.all(executing);
    results.push(...remaining);
    
    return results;
  }
  
  static async executeWithBackpressure<T>(
    items: T[],
    processor: (item: T) => Promise<any>,
    options: {
      maxConcurrency?: number;
      delayBetweenBatches?: number;
      batchSize?: number;
    } = {}
  ): Promise<any[]> {
    const {
      maxConcurrency = 3,
      delayBetweenBatches = 100,
      batchSize = 10
    } = options;
    
    const results: any[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await this.distributeWork(batch, processor, maxConcurrency);
      results.push(...batchResults);
      
      // Add delay between batches to prevent overwhelming the API
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
    
    return results;
  }
}
```

### 2. Caching Strategies

#### Multi-Level Caching
```typescript
class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly maxMemoryCacheSize = 1000;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.value as T;
    }
    
    // Check persistent cache (Redis, database, etc.)
    const persistentValue = await this.getPersistent<T>(key);
    if (persistentValue) {
      // Populate memory cache
      this.setMemory(key, persistentValue);
      return persistentValue;
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T, ttl = this.defaultTTL): Promise<void> {
    // Set in memory cache
    this.setMemory(key, value, ttl);
    
    // Set in persistent cache
    await this.setPersistent(key, value, ttl);
  }
  
  private setMemory<T>(key: string, value: T, ttl = this.defaultTTL): void {
    // Evict oldest entries if cache is full
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
    
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }
  
  private async getPersistent<T>(key: string): Promise<T | null> {
    // Implement persistent cache retrieval (Redis, etc.)
    return null;
  }
  
  private async setPersistent<T>(key: string, value: T, ttl: number): Promise<void> {
    // Implement persistent cache storage
  }
  
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
}

// Cached Shuriken implementation
class CachedShuriken extends Shuriken {
  private cache = new CacheManager();
  
  async execute(parameters: any): Promise<ExecutionResult<any>> {
    const cacheKey = this.generateCacheKey(parameters);
    
    // Check cache first
    const cachedResult = await this.cache.get<any>(cacheKey);
    if (cachedResult) {
      return {
        result: cachedResult,
        executionTime: 0,
        cached: true
      };
    }
    
    // Execute and cache result
    const result = await super.execute(parameters);
    
    // Cache successful results
    if (result.result && !result.result.error) {
      await this.cache.set(cacheKey, result.result, this.getCacheTTL());
    }
    
    return result;
  }
  
  private generateCacheKey(parameters: any): string {
    return `${this.getName()}:${JSON.stringify(parameters)}`;
  }
  
  private getCacheTTL(): number {
    // Different TTL based on shuriken type
    const ttlMap = {
      'web_search': 10 * 60 * 1000,    // 10 minutes
      'weather': 30 * 60 * 1000,       // 30 minutes
      'calculator': 60 * 60 * 1000,    // 1 hour
      'static_data': 24 * 60 * 60 * 1000 // 24 hours
    };
    
    return ttlMap[this.getName()] || 5 * 60 * 1000; // Default 5 minutes
  }
}
```

### 3. Resource Management

#### Memory Optimization
```typescript
class MemoryOptimizedRuntime extends KataRuntime {
  private readonly maxMemoryUsage = 0.8; // 80% of available memory
  private readonly gcThreshold = 0.7; // Trigger GC at 70%
  
  async executeWithMemoryManagement<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    // Check memory before execution
    await this.checkMemoryUsage();
    
    const startMemory = process.memoryUsage();
    
    try {
      const result = await operation();
      
      // Check memory after execution
      await this.checkMemoryUsage();
      
      return result;
    } finally {
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      
      // Log memory usage
      await this.logger.debug('Memory usage', {
        memoryDelta,
        heapUsed: endMemory.heapUsed,
        heapTotal: endMemory.heapTotal
      });
    }
  }
  
  private async checkMemoryUsage(): Promise<void> {
    const usage = process.memoryUsage();
    const memoryUsagePercent = usage.heapUsed / usage.heapTotal;
    
    if (memoryUsagePercent > this.maxMemoryUsage) {
      throw new Error(`Memory usage too high: ${(memoryUsagePercent * 100).toFixed(1)}%`);
    }
    
    if (memoryUsagePercent > this.gcThreshold) {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        await this.logger.debug('Forced garbage collection');
      }
    }
  }
  
  // Implement object pooling for frequently created objects
  private objectPool = new Map<string, any[]>();
  
  getPooledObject<T>(type: string, factory: () => T): T {
    const pool = this.objectPool.get(type) || [];
    
    if (pool.length > 0) {
      return pool.pop() as T;
    }
    
    return factory();
  }
  
  returnToPool<T>(type: string, object: T): void {
    const pool = this.objectPool.get(type) || [];
    
    // Limit pool size to prevent memory leaks
    if (pool.length < 100) {
      pool.push(object);
      this.objectPool.set(type, pool);
    }
  }
}
```

## 📊 Monitoring and Profiling

### 1. Performance Monitoring

#### Comprehensive Performance Tracking
```typescript
class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric[]>();
  private readonly maxMetricsPerType = 1000;
  
  async trackExecution<T>(
    operation: string,
    executor: () => Promise<T>
  ): Promise<T & { performanceData: PerformanceData }> {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await executor();
      
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      
      const performanceData = this.calculatePerformanceData(
        startTime,
        endTime,
        startMemory,
        endMemory
      );
      
      this.recordMetric(operation, {
        ...performanceData,
        success: true,
        timestamp: new Date()
      });
      
      return {
        ...result,
        performanceData
      };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      
      const performanceData = this.calculatePerformanceData(
        startTime,
        endTime,
        startMemory,
        endMemory
      );
      
      this.recordMetric(operation, {
        ...performanceData,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
      
      throw error;
    }
  }
  
  private calculatePerformanceData(
    startTime: bigint,
    endTime: bigint,
    startMemory: NodeJS.MemoryUsage,
    endMemory: NodeJS.MemoryUsage
  ): PerformanceData {
    const executionTimeNs = endTime - startTime;
    const executionTimeMs = Number(executionTimeNs) / 1_000_000;
    
    return {
      executionTime: executionTimeMs,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      peakMemory: endMemory.heapUsed,
      cpuUsage: process.cpuUsage()
    };
  }
  
  private recordMetric(operation: string, metric: PerformanceMetric): void {
    const metrics = this.metrics.get(operation) || [];
    
    metrics.push(metric);
    
    // Keep only recent metrics to prevent memory growth
    if (metrics.length > this.maxMetricsPerType) {
      metrics.shift();
    }
    
    this.metrics.set(operation, metrics);
  }
  
  getPerformanceStats(operation: string): PerformanceStats | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return null;
    
    const successfulMetrics = metrics.filter(m => m.success);
    const executionTimes = successfulMetrics.map(m => m.executionTime);
    const memoryDeltas = successfulMetrics.map(m => m.memoryDelta);
    
    return {
      operation,
      totalExecutions: metrics.length,
      successfulExecutions: successfulMetrics.length,
      failureRate: (metrics.length - successfulMetrics.length) / metrics.length,
      averageExecutionTime: this.average(executionTimes),
      medianExecutionTime: this.median(executionTimes),
      p95ExecutionTime: this.percentile(executionTimes, 95),
      averageMemoryDelta: this.average(memoryDeltas),
      maxMemoryDelta: Math.max(...memoryDeltas)
    };
  }
  
  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }
  
  private median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }
  
  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

interface PerformanceData {
  executionTime: number;
  memoryDelta: number;
  peakMemory: number;
  cpuUsage: NodeJS.CpuUsage;
}

interface PerformanceMetric extends PerformanceData {
  success: boolean;
  error?: string;
  timestamp: Date;
}

interface PerformanceStats {
  operation: string;
  totalExecutions: number;
  successfulExecutions: number;
  failureRate: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  averageMemoryDelta: number;
  maxMemoryDelta: number;
}
```

### 2. Real-time Performance Dashboard

#### Performance Dashboard Implementation
```typescript
class PerformanceDashboard {
  private monitor: PerformanceMonitor;
  private updateInterval: NodeJS.Timeout;
  
  constructor(monitor: PerformanceMonitor) {
    this.monitor = monitor;
    this.startDashboard();
  }
  
  private startDashboard(): void {
    this.updateInterval = setInterval(() => {
      this.displayMetrics();
    }, 5000); // Update every 5 seconds
  }
  
  private displayMetrics(): void {
    console.clear();
    console.log('🚀 Ninja Agents Performance Dashboard');
    console.log('=====================================\n');
    
    // System metrics
    this.displaySystemMetrics();
    
    // Operation metrics
    this.displayOperationMetrics();
    
    console.log('\n📊 Dashboard updates every 5 seconds');
  }
  
  private displaySystemMetrics(): void {
    const usage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    console.log('💻 System Metrics:');
    console.log(`   Memory: ${(usage.heapUsed / 1024 / 1024).toFixed(1)}MB / ${(usage.heapTotal / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   CPU User: ${(cpuUsage.user / 1000).toFixed(1)}ms`);
    console.log(`   CPU System: ${(cpuUsage.system / 1000).toFixed(1)}ms`);
    console.log('');
  }
  
  private displayOperationMetrics(): void {
    console.log('🎯 Operation Performance:');
    
    const operations = ['shinobi_execute', 'kata_execute', 'shuriken_execute'];
    
    operations.forEach(operation => {
      const stats = this.monitor.getPerformanceStats(operation);
      if (stats) {
        console.log(`   ${operation}:`);
        console.log(`     Executions: ${stats.totalExecutions} (${(stats.failureRate * 100).toFixed(1)}% failure rate)`);
        console.log(`     Avg Time: ${stats.averageExecutionTime.toFixed(1)}ms`);
        console.log(`     P95 Time: ${stats.p95ExecutionTime.toFixed(1)}ms`);
        console.log(`     Avg Memory: ${(stats.averageMemoryDelta / 1024 / 1024).toFixed(1)}MB`);
        console.log('');
      }
    });
  }
  
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
```

## 🔧 Optimization Techniques

### 1. Prompt Optimization

#### Efficient Prompt Engineering
```typescript
class PromptOptimizer {
  static optimizeForSpeed(prompt: string): string {
    return prompt
      // Remove unnecessary words
      .replace(/\b(please|kindly|could you|would you)\b/gi, '')
      // Use more direct language
      .replace(/\bI would like you to\b/gi, '')
      .replace(/\bCan you help me\b/gi, '')
      // Remove redundant phrases
      .replace(/\bin detail\b/gi, '')
      .replace(/\bcomprehensive\b/gi, '')
      // Trim whitespace
      .trim();
  }
  
  static optimizeForTokens(prompt: string, maxTokens: number): string {
    const words = prompt.split(' ');
    
    if (words.length <= maxTokens * 0.75) { // Rough token estimation
      return prompt;
    }
    
    // Prioritize key information
    const keyPhrases = this.extractKeyPhrases(prompt);
    const optimized = keyPhrases.slice(0, Math.floor(maxTokens * 0.75)).join(' ');
    
    return optimized;
  }
  
  private static extractKeyPhrases(text: string): string[] {
    // Simple key phrase extraction
    const sentences = text.split(/[.!?]+/);
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .sort((a, b) => b.length - a.length); // Prioritize longer sentences
  }
  
  static createTemplate(basePrompt: string, variables: string[]): PromptTemplate {
    return {
      template: basePrompt,
      variables,
      render: (values: Record<string, string>) => {
        let rendered = basePrompt;
        variables.forEach(variable => {
          rendered = rendered.replace(
            new RegExp(`{{${variable}}}`, 'g'),
            values[variable] || ''
          );
        });
        return rendered;
      }
    };
  }
}

interface PromptTemplate {
  template: string;
  variables: string[];
  render: (values: Record<string, string>) => string;
}

// Optimized Kata with prompt templates
class OptimizedPromptKata extends Kata {
  private promptTemplate: PromptTemplate;
  
  constructor(runtime: KataRuntime, config: KataConfig & { promptTemplate?: PromptTemplate }) {
    super(runtime, config);
    
    if (config.promptTemplate) {
      this.promptTemplate = config.promptTemplate;
    } else {
      // Create default optimized template
      this.promptTemplate = PromptOptimizer.createTemplate(
        `Task: {{task}}\nContext: {{context}}\nRequirements: {{requirements}}`,
        ['task', 'context', 'requirements']
      );
    }
  }
  
  async execute(userQuery: string): Promise<ExecutionResult<string | any>> {
    // Extract variables from query
    const variables = this.extractVariables(userQuery);
    
    // Render optimized prompt
    const optimizedPrompt = this.promptTemplate.render(variables);
    
    return await super.execute(optimizedPrompt);
  }
  
  private extractVariables(query: string): Record<string, string> {
    // Simple variable extraction logic
    return {
      task: query,
      context: '',
      requirements: 'Be concise and accurate'
    };
  }
}
```

### 2. Connection Pooling and Reuse

#### Optimized Runtime Management
```typescript
class ConnectionPoolManager {
  private static instance: ConnectionPoolManager;
  private runtimePool: KataRuntime[] = [];
  private readonly maxPoolSize = 10;
  private readonly minPoolSize = 2;
  private activeConnections = 0;
  
  static getInstance(): ConnectionPoolManager {
    if (!this.instance) {
      this.instance = new ConnectionPoolManager();
    }
    return this.instance;
  }
  
  async getRuntime(): Promise<KataRuntime> {
    if (this.runtimePool.length > 0) {
      const runtime = this.runtimePool.pop()!;
      this.activeConnections++;
      return runtime;
    }
    
    // Create new runtime if pool is empty
    const runtime = await this.createRuntime();
    this.activeConnections++;
    return runtime;
  }
  
  releaseRuntime(runtime: KataRuntime): void {
    this.activeConnections--;
    
    if (this.runtimePool.length < this.maxPoolSize) {
      this.runtimePool.push(runtime);
    }
    // If pool is full, let the runtime be garbage collected
  }
  
  private async createRuntime(): Promise<KataRuntime> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 3
    });
    
    const logger = new Logger('info', 'PooledRuntime');
    const memory = new Memory({
      enableDatabaseLogging: false, // Disable for performance
      enableFileLogging: false
    });
    
    return new KataRuntime(openai, logger, memory);
  }
  
  async warmPool(): Promise<void> {
    const promises = Array.from({ length: this.minPoolSize }, () => 
      this.createRuntime()
    );
    
    const runtimes = await Promise.all(promises);
    this.runtimePool.push(...runtimes);
  }
  
  getPoolStats(): PoolStats {
    return {
      poolSize: this.runtimePool.length,
      activeConnections: this.activeConnections,
      maxPoolSize: this.maxPoolSize,
      utilization: this.activeConnections / this.maxPoolSize
    };
  }
}

interface PoolStats {
  poolSize: number;
  activeConnections: number;
  maxPoolSize: number;
  utilization: number;
}

// Usage with automatic pool management
class PooledExecutor {
  private poolManager = ConnectionPoolManager.getInstance();
  
  async execute<T>(operation: (runtime: KataRuntime) => Promise<T>): Promise<T> {
    const runtime = await this.poolManager.getRuntime();
    
    try {
      return await operation(runtime);
    } finally {
      this.poolManager.releaseRuntime(runtime);
    }
  }
}
```

## 📈 Benchmarking and Testing

### 1. Performance Benchmarks

#### Comprehensive Benchmarking Suite
```typescript
class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  
  async runBenchmark(
    name: string,
    operation: () => Promise<any>,
    iterations = 100
  ): Promise<BenchmarkResult> {
    console.log(`🏃 Running benchmark: ${name} (${iterations} iterations)`);
    
    const times: number[] = [];
    const memoryUsages: number[] = [];
    let errors = 0;
    
    // Warm-up run
    try {
      await operation();
    } catch {
      // Ignore warm-up errors
    }
    
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage().heapUsed;
      
      try {
        await operation();
        
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage().heapUsed;
        
        const executionTime = Number(endTime - startTime) / 1_000_000; // Convert to ms
        const memoryDelta = endMemory - startMemory;
        
        times.push(executionTime);
        memoryUsages.push(memoryDelta);
      } catch (error) {
        errors++;
      }
      
      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const result: BenchmarkResult = {
      name,
      iterations,
      successfulRuns: iterations - errors,
      errorRate: errors / iterations,
      averageTime: this.average(times),
      medianTime: this.median(times),
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      p95Time: this.percentile(times, 95),
      p99Time: this.percentile(times, 99),
      averageMemory: this.average(memoryUsages),
      maxMemory: Math.max(...memoryUsages),
      timestamp: new Date()
    };
    
    this.results.push(result);
    this.displayResult(result);
    
    return result;
  }
  
  async runComparisonBenchmark(
    scenarios: Array<{ name: string; operation: () => Promise<any> }>,
    iterations = 50
  ): Promise<void> {
    console.log('🏁 Running comparison benchmark...\n');
    
    const results: BenchmarkResult[] = [];
    
    for (const scenario of scenarios) {
      const result = await this.runBenchmark(scenario.name, scenario.operation, iterations);
      results.push(result);
    }
    
    this.displayComparison(results);
  }
  
  private displayResult(result: BenchmarkResult): void {
    console.log(`\n📊 Benchmark Results: ${result.name}`);
    console.log(`   Success Rate: ${((1 - result.errorRate) * 100).toFixed(1)}%`);
    console.log(`   Average Time: ${result.averageTime.toFixed(2)}ms`);
    console.log(`   Median Time: ${result.medianTime.toFixed(2)}ms`);
    console.log(`   P95 Time: ${result.p95Time.toFixed(2)}ms`);
    console.log(`   P99 Time: ${result.p99Time.toFixed(2)}ms`);
    console.log(`   Memory Usage: ${(result.averageMemory / 1024 / 1024).toFixed(2)}MB avg`);
  }
  
  private displayComparison(results: BenchmarkResult[]): void {
    console.log('\n🏆 Comparison Results:');
    console.log('========================');
    
    // Sort by average time
    const sorted = [...results].sort((a, b) => a.averageTime - b.averageTime);
    
    sorted.forEach((result, index) => {
      const rank = index + 1;
      const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
      console.log(`${emoji} ${rank}. ${result.name}: ${result.averageTime.toFixed(2)}ms avg`);
    });
  }
  
  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }
  
  private median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }
  
  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

interface BenchmarkResult {
  name: string;
  iterations: number;
  successfulRuns: number;
  errorRate: number;
  averageTime: number;
  medianTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  p99Time: number;
  averageMemory: number;
  maxMemory: number;
  timestamp: Date;
}
```

### 2. Load Testing

#### Stress Testing Implementation
```typescript
class LoadTester {
  async runLoadTest(
    operation: () => Promise<any>,
    config: LoadTestConfig
  ): Promise<LoadTestResult> {
    console.log(`🔥 Starting load test: ${config.name}`);
    console.log(`   Concurrent Users: ${config.concurrentUsers}`);
    console.log(`   Duration: ${config.durationMs}ms`);
    console.log(`   Ramp-up: ${config.rampUpMs}ms\n`);
    
    const results: ExecutionResult[] = [];
    const startTime = Date.now();
    const endTime = startTime + config.durationMs;
    
    // Ramp up users gradually
    const userPromises: Promise<void>[] = [];
    
    for (let i = 0; i < config.concurrentUsers; i++) {
      const userDelay = (config.rampUpMs / config.concurrentUsers) * i;
      
      const userPromise = this.simulateUser(
        operation,
        userDelay,
        endTime,
        results
      );
      
      userPromises.push(userPromise);
    }
    
    // Wait for all users to complete
    await Promise.all(userPromises);
    
    return this.analyzeResults(config, results);
  }
  
  private async simulateUser(
    operation: () => Promise<any>,
    delay: number,
    endTime: number,
    results: ExecutionResult[]
  ): Promise<void> {
    // Wait for ramp-up delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    while (Date.now() < endTime) {
      const startTime = Date.now();
      
      try {
        await operation();
        
        results.push({
          success: true,
          duration: Date.now() - startTime,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          success: false,
          duration: Date.now() - startTime,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  private analyzeResults(
    config: LoadTestConfig,
    results: ExecutionResult[]
  ): LoadTestResult {
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    const durations = successfulResults.map(r => r.duration);
    const throughput = results.length / (config.durationMs / 1000);
    
    return {
      config,
      totalRequests: results.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      successRate: successfulResults.length / results.length,
      averageResponseTime: this.average(durations),
      medianResponseTime: this.median(durations),
      p95ResponseTime: this.percentile(durations, 95),
      p99ResponseTime: this.percentile(durations, 99),
      maxResponseTime: Math.max(...durations),
      minResponseTime: Math.min(...durations),
      throughput,
      errors: this.categorizeErrors(failedResults)
    };
  }
  
  private categorizeErrors(failedResults: ExecutionResult[]): Record<string, number> {
    const errorCounts: Record<string, number> = {};
    
    failedResults.forEach(result => {
      const error = result.error || 'Unknown error';
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });
    
    return errorCounts;
  }
  
  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }
  
  private median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }
  
  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

interface LoadTestConfig {
  name: string;
  concurrentUsers: number;
  durationMs: number;
  rampUpMs: number;
}

interface ExecutionResult {
  success: boolean;
  duration: number;
  timestamp: Date;
  error?: string;
}

interface LoadTestResult {
  config: LoadTestConfig;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  throughput: number;
  errors: Record<string, number>;
}
```

## 📋 Performance Checklist

### Pre-Production Performance Checklist

- [ ] **Model Selection**
  - [ ] Appropriate model chosen for task complexity
  - [ ] Dynamic model selection implemented where beneficial
  - [ ] Parameter optimization completed
  - [ ] Token usage optimized

- [ ] **Execution Optimization**
  - [ ] Parallel execution configured appropriately
  - [ ] Caching implemented for repeated operations
  - [ ] Connection pooling configured
  - [ ] Resource limits set and monitored

- [ ] **Memory Management**
  - [ ] Memory usage monitoring implemented
  - [ ] Garbage collection optimization configured
  - [ ] Memory leaks identified and fixed
  - [ ] Object pooling implemented where beneficial

- [ ] **Monitoring**
  - [ ] Performance metrics collection implemented
  - [ ] Real-time monitoring dashboard configured
  - [ ] Alerting set up for performance degradation
  - [ ] Benchmarking suite created

- [ ] **Load Testing**
  - [ ] Load tests completed for expected traffic
  - [ ] Stress tests performed to find breaking points
  - [ ] Performance regression tests implemented
  - [ ] Capacity planning completed

### Performance Optimization Checklist

- [ ] **Code Optimization**
  - [ ] Prompt engineering optimized for efficiency
  - [ ] Unnecessary API calls eliminated
  - [ ] Efficient data structures used
  - [ ] Async/await patterns optimized

- [ ] **Infrastructure Optimization**
  - [ ] Appropriate server sizing
  - [ ] CDN configured for static assets
  - [ ] Database queries optimized
  - [ ] Network latency minimized

- [ ] **Scaling Preparation**
  - [ ] Horizontal scaling strategy defined
  - [ ] Load balancing configured
  - [ ] Auto-scaling rules implemented
  - [ ] Circuit breakers implemented

This comprehensive performance guide provides the foundation for building high-performance applications with the Ninja Agents SDK. Regular performance monitoring and optimization are essential for maintaining optimal system performance as your application scales.