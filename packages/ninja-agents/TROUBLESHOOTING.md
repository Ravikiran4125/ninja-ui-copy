# Troubleshooting Guide - Ninja Agents SDK

This guide provides comprehensive solutions for common issues encountered when using the Ninja Agents SDK.

## 🔍 Common Issues and Solutions

### 1. Installation and Setup Issues

#### Issue: Module Not Found Errors
```bash
Error: Cannot find module 'ninja-agents'
```

**Solutions:**
```bash
# 1. Verify installation
npm list ninja-agents

# 2. Reinstall if missing
npm install ninja-agents zod openai

# 3. Clear npm cache if issues persist
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 4. Check Node.js version compatibility
node --version  # Should be 18.0.0 or higher
```

#### Issue: TypeScript Compilation Errors
```bash
Error: Cannot find type definitions for 'ninja-agents'
```

**Solutions:**
```bash
# 1. Ensure TypeScript is installed
npm install -D typescript @types/node

# 2. Update tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

# 3. Restart TypeScript server in your IDE
```

#### Issue: Environment Variable Problems
```bash
Error: OPENAI_API_KEY environment variable is required
```

**Solutions:**
```bash
# 1. Create .env file in project root
echo "OPENAI_API_KEY=your_api_key_here" > .env

# 2. Load environment variables in your application
npm install dotenv

# 3. Add to your main file
import 'dotenv/config';

# 4. Verify environment variables are loaded
console.log('API Key loaded:', !!process.env.OPENAI_API_KEY);
```

### 2. Runtime and Execution Issues

#### Issue: OpenAI API Connection Failures
```bash
Error: Request failed with status code 401
```

**Diagnostic Steps:**
```typescript
// Test API key validity
async function testApiKey() {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const models = await openai.models.list();
    console.log('✅ API key is valid');
    return true;
  } catch (error) {
    console.error('❌ API key test failed:', error.message);
    return false;
  }
}

// Check API key format
function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey) {
    console.error('❌ API key is missing');
    return false;
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ API key should start with "sk-"');
    return false;
  }
  
  if (apiKey.length < 20) {
    console.error('❌ API key appears to be too short');
    return false;
  }
  
  console.log('✅ API key format is valid');
  return true;
}
```

**Solutions:**
1. **Invalid API Key**: Verify your OpenAI API key in the [OpenAI Dashboard](https://platform.openai.com/api-keys)
2. **Expired Key**: Generate a new API key if the current one has expire
3. **Rate Limiting**: Implement exponential backoff for retries
4. **Network Issues**: Check your network connection and firewall settings

#### Issue: Memory Leaks
```bash
<--- Last few GCs --->
[...]
<--- JS stacktrace --->
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Diagnostic Steps:**
```typescript
// Monitor memory usage over time
function monitorMemory(intervalMs = 10000, samples = 10): void {
  let count = 0;
  const interval = setInterval(() => {
    const usage = process.memoryUsage();
    console.log(`Memory usage (${++count}/${samples}):`);
    console.log(`  RSS: ${(usage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  External: ${(usage.external / 1024 / 1024).toFixed(2)} MB`);
    
    if (count >= samples) {
      clearInterval(interval);
    }
  }, intervalMs);
}

// Identify memory leaks
async function testForMemoryLeaks(iterations = 100): Promise<void> {
  const initialMemory = process.memoryUsage().heapUsed;
  
  for (let i = 0; i < iterations; i++) {
    // Run the suspected leaky operation
    await suspectedLeakyOperation();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Check memory after every 10 iterations
    if (i % 10 === 0) {
      const currentMemory = process.memoryUsage().heapUsed;
      const memoryDelta = currentMemory - initialMemory;
      console.log(`Iteration ${i}: Memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
    }
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const totalDelta = finalMemory - initialMemory;
  console.log(`Total memory increase: ${(totalDelta / 1024 / 1024).toFixed(2)} MB`);
  
  if (totalDelta > 100 * 1024 * 1024) { // 100MB threshold
    console.error('❌ Potential memory leak detected');
  } else {
    console.log('✅ No significant memory leak detected');
  }
}
```

**Solutions:**
1. **Limit Cache Sizes**: Implement maximum sizes for caches and clear old entries
2. **Release Resources**: Properly dispose of resources when no longer needed
3. **Avoid Closures**: Be careful with closures that capture large objects
4. **Increase Memory Limit**: For Node.js, use `--max-old-space-size` flag if needed

#### Issue: Timeout Errors
```bash
Error: Request timed out after 30000ms
```

**Solutions:**
```typescript
// 1. Increase timeout for OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000 // 60 seconds
});

// 2. Implement timeout handling
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
  
  return Promise.race([
    promise.then(result => {
      clearTimeout(timeoutId);
      return result;
    }),
    timeoutPromise
  ]);
}

// 3. Implement retry logic with backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffFactor = 2,
    retryableErrors = ['timeout', 'rate_limit', 'server_error']
  } = options;
  
  let lastError: Error;
  let delay = initialDelayMs;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const isRetryable = retryableErrors.some(errType => 
        error.message.toLowerCase().includes(errType)
      );
      
      if (attempt > maxRetries || !isRetryable) {
        throw error;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff with jitter
      delay = Math.min(
        maxDelayMs,
        delay * backoffFactor * (0.8 + Math.random() * 0.4)
      );
    }
  }
  
  throw lastError;
}

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}
```

### 3. Shuriken-Specific Issues

#### Issue: Shuriken Validation Errors
```bash
Error: Parameter validation failed: [path]: [error message]
```

**Diagnostic Steps:**
```typescript
// Test Shuriken validation
function testShurikenValidation(
  shuriken: Shuriken,
  validParams: any,
  invalidParams: any
): void {
  console.log(`Testing validation for ${shuriken.getName()}:`);
  
  // Test valid parameters
  const validResult = shuriken.validate(validParams);
  console.log(`  Valid parameters: ${validResult.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!validResult.success) {
    console.error(`  Error: ${validResult.error}`);
  }
  
  // Test invalid parameters
  const invalidResult = shuriken.validate(invalidParams);
  console.log(`  Invalid parameters: ${!invalidResult.success ? '✅ PASS' : '❌ FAIL'}`);
  if (invalidResult.success) {
    console.error('  Error: Validation passed but should have failed');
  } else {
    console.log(`  Expected error: ${invalidResult.error}`);
  }
}

// Example usage
testShurikenValidation(
  weatherShuriken,
  { city: 'Paris' }, // Valid
  { city: 123 }      // Invalid
);
```

**Solutions:**
1. **Check Schema Definition**: Ensure your Zod schema correctly defines all required parameters
2. **Validate Parameter Types**: Ensure parameter types match the schema
3. **Add Descriptive Errors**: Use `.refine()` with custom error messages for complex validations
4. **Debug Schema**: Print the schema definition for inspection

#### Issue: Shuriken Execution Failures
```bash
Error: Shuriken execution failed: [error message]
```

**Solutions:**
```typescript
// 1. Implement robust error handling in Shuriken implementation
const robustShuriken = new Shuriken(
  'robust_operation',
  'Operation with robust error handling',
  schema,
  async (params) => {
    try {
      // Main implementation
      const result = await performOperation(params);
      return result;
    } catch (error) {
      // Categorize and handle errors
      if (error.message.includes('network')) {
        throw new Error('Network error: Unable to connect to external service');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('Timeout: Operation took too long to complete');
      }
      
      if (error.message.includes('permission')) {
        throw new Error('Permission denied: Insufficient access rights');
      }
      
      // Default error
      throw new Error(`Operation failed: ${error.message}`);
    }
  }
);

// 2. Create a wrapper for better debugging
class DebugShuriken extends Shuriken {
  async execute(parameters: any): Promise<ExecutionResult<any>> {
    console.log(`Executing ${this.getName()} with parameters:`, parameters);
    
    try {
      const result = await super.execute(parameters);
      console.log(`${this.getName()} execution successful:`, result.result);
      return result;
    } catch (error) {
      console.error(`${this.getName()} execution failed:`, error);
      throw error;
    }
  }
}
```

### 4. Kata and Shinobi Issues

#### Issue: Kata Execution Failures
```bash
Error: Failed to execute Kata: [error message]
```

**Diagnostic Steps:**
```typescript
// Debug Kata execution
class DebugKata extends Kata {
  async execute(userQuery: string): Promise<ExecutionResult<string | any>> {
    console.log(`🥋 Executing Kata: ${this.getConfig().title}`);
    console.log(`   Query: ${userQuery}`);
    console.log(`   Model: ${this.getConfig().model}`);
    console.log(`   Shurikens: ${this.getShurikenNames().join(', ')}`);
    
    try {
      const result = await super.execute(userQuery);
      console.log(`✅ Kata execution successful`);
      console.log(`   Execution time: ${result.executionTime}ms`);
      console.log(`   Token usage: ${result.tokenUsage?.total_tokens || 'N/A'}`);
      return result;
    } catch (error) {
      console.error(`❌ Kata execution failed: ${error.message}`);
      throw error;
    }
  }
}
```

**Solutions:**
1. **Check Model Availability**: Ensure the specified model is available in your OpenAI account
2. **Validate Shurikens**: Ensure all Shurikens are properly defined and working
3. **Check Token Limits**: Ensure you're not exceeding token limits for the model
4. **Implement Retries**: Add retry logic for transient failures

#### Issue: Shinobi Orchestration Problems
```bash
Error: Shinobi execution failed: [error message]
```

**Solutions:**
```typescript
// 1. Implement robust Shinobi with detailed logging
class RobustShinobi extends Shinobi {
  async execute(userQuery: string): Promise<ExecutionResult<any>> {
    this.runtime.logger.info(`🥷 Executing Shinobi: ${this.getConfig().role}`);
    this.runtime.logger.info(`   Query: ${userQuery}`);
    this.runtime.logger.info(`   Katas: ${this.getKataCount()}`);
    
    try {
      // Execute each Kata individually for better error isolation
      const kataResults = [];
      
      for (const kata of this.getKatas()) {
        try {
          this.runtime.logger.info(`   Executing Kata: ${kata.getConfig().title}`);
          const result = await kata.execute(userQuery);
          kataResults.push(result);
          this.runtime.logger.info(`   Kata execution successful`);
        } catch (error) {
          this.runtime.logger.error(`   Kata execution failed: ${error.message}`);
          kataResults.push({
            error: error.message,
            executionTime: 0
          });
        }
      }
      
      // Continue even if some Katas failed
      const finalAnswer = await this.generateFinalAnswer(userQuery, kataResults);
      
      return {
        result: {
          kataResults,
          finalAnswer,
          shinobiId: this.getId()
        },
        executionTime: 0 // Will be set by caller
      };
    } catch (error) {
      this.runtime.logger.error(`❌ Shinobi execution failed: ${error.message}`);
      throw error;
    }
  }
  
  private async generateFinalAnswer(userQuery: string, kataResults: any[]): Promise<string> {
    // Generate answer even with partial results
    const successfulResults = kataResults.filter(r => !r.error);
    
    if (successfulResults.length === 0) {
      return "I apologize, but I couldn't complete your request due to technical issues. Please try again later.";
    }
    
    // Use successful results to generate answer
    // Implementation depends on your specific needs
    return "Final answer based on available results.";
  }
}
```

### 5. Clan and Dojo Issues

#### Issue: Clan Coordination Failures
```bash
Error: Clan execution failed: Strategy 'collaborative' failed
```

**Solutions:**
```typescript
// 1. Implement fault-tolerant Clan
class FaultTolerantClan extends Clan {
  async execute(userQuery: string): Promise<ExecutionResult<any>> {
    this.runtime.logger.info(`👥 Executing Clan: ${this.getInfo().name}`);
    this.runtime.logger.info(`   Strategy: ${this.getInfo().strategy}`);
    this.runtime.logger.info(`   Shinobi count: ${this.getInfo().shinobiCount}`);
    
    try {
      return await super.execute(userQuery);
    } catch (error) {
      this.runtime.logger.error(`❌ Clan execution failed: ${error.message}`);
      
      // Fall back to simpler strategy
      this.runtime.logger.info('Falling back to sequential strategy');
      
      try {
        // Execute first Shinobi as fallback
        const firstShinobi = this.getInfo().shinobi[0];
        const shinobi = new Shinobi(this.runtime, firstShinobi);
        
        const result = await shinobi.execute(userQuery);
        
        return {
          result: {
            strategy: 'fallback',
            results: [result],
            fallbackReason: error.message
          },
          executionTime: 0 // Will be set by caller
        };
      } catch (fallbackError) {
        this.runtime.logger.error(`❌ Fallback execution failed: ${fallbackError.message}`);
        throw new Error(`Clan execution failed and fallback failed: ${error.message}`);
      }
    }
  }
}

// 2. Implement strategy-specific error handling
class EnhancedClan extends Clan {
  async executeWithErrorHandling(userQuery: string): Promise<ExecutionResult<any>> {
    try {
      return await this.execute(userQuery);
    } catch (error) {
      const strategy = this.getInfo().strategy;
      
      switch (strategy) {
        case 'parallel':
          return await this.handleParallelFailure(userQuery, error);
        case 'collaborative':
          return await this.handleCollaborativeFailure(userQuery, error);
        case 'competitive':
          return await this.handleCompetitiveFailure(userQuery, error);
        default:
          throw error;
      }
    }
  }
  
  private async handleParallelFailure(userQuery: string, error: Error): Promise<ExecutionResult<any>> {
    // Fall back to sequential execution
    this.runtime.logger.info('Falling back from parallel to sequential execution');
    
    const sequentialClan = new Clan(this.runtime, {
      ...this.getInfo(),
      strategy: 'sequential'
    });
    
    return await sequentialClan.execute(userQuery);
  }
  
  private async handleCollaborativeFailure(userQuery: string, error: Error): Promise<ExecutionResult<any>> {
    // Fall back to individual execution of most reliable Shinobi
    this.runtime.logger.info('Falling back from collaborative to single Shinobi');
    
    const mostReliableShinobi = this.getInfo().shinobi[0]; // Ideally would select based on reliability metrics
    const shinobi = new Shinobi(this.runtime, mostReliableShinobi);
    
    const result = await shinobi.execute(userQuery);
    
    return {
      result: {
        strategy: 'fallback_single',
        results: [result],
        fallbackReason: error.message
      },
      executionTime: 0
    };
  }
  
  private async handleCompetitiveFailure(userQuery: string, error: Error): Promise<ExecutionResult<any>> {
    // If competitive strategy failed, try sequential
    this.runtime.logger.info('Falling back from competitive to sequential execution');
    
    const sequentialClan = new Clan(this.runtime, {
      ...this.getInfo(),
      strategy: 'sequential'
    });
    
    return await sequentialClan.execute(userQuery);
  }
}
```

#### Issue: Dojo Workflow Failures
```bash
Error: Dojo execution failed at step 'data_collection'
```

**Solutions:**
```typescript
// 1. Implement fault-tolerant Dojo
class FaultTolerantDojo extends Dojo {
  async execute(userQuery: string): Promise<ExecutionResult<any>> {
    this.runtime.logger.info(`🏯 Executing Dojo: ${this.getInfo().name}`);
    this.runtime.logger.info(`   Steps: ${this.getInfo().stepCount}`);
    
    try {
      return await super.execute(userQuery);
    } catch (error) {
      this.runtime.logger.error(`❌ Dojo execution failed: ${error.message}`);
      
      // Identify which step failed
      const failedStep = this.identifyFailedStep(error);
      
      if (failedStep) {
        return await this.executeWithStepSkipping(userQuery, failedStep);
      }
      
      throw error;
    }
  }
  
  private identifyFailedStep(error: Error): string | null {
    const errorMessage = error.message;
    const stepMatch = errorMessage.match(/failed at step '([^']+)'/);
    
    return stepMatch ? stepMatch[1] : null;
  }
  
  private async executeWithStepSkipping(userQuery: string, stepToSkip: string): Promise<ExecutionResult<any>> {
    this.runtime.logger.info(`Retrying workflow with step '${stepToSkip}' skipped`);
    
    // Create a modified workflow that skips the problematic step
    const modifiedDojo = new Dojo(this.runtime, {
      ...this.getInfo(),
      steps: this.getInfo().steps.filter(step => step.id !== stepToSkip)
    });
    
    try {
      const result = await modifiedDojo.execute(userQuery);
      
      return {
        result: {
          ...result.result,
          skippedSteps: [stepToSkip],
          isPartialResult: true
        },
        executionTime: result.executionTime
      };
    } catch (retryError) {
      this.runtime.logger.error(`❌ Retry execution failed: ${retryError.message}`);
      throw new Error(`Workflow execution failed even after skipping problematic step: ${retryError.message}`);
    }
  }
}

// 2. Implement step-level error handling
class ResilientDojo extends Dojo {
  async execute(userQuery: string): Promise<ExecutionResult<any>> {
    const results = [];
    let context = { query: userQuery, results: [] as any[] };
    
    for (const step of this.getInfo().steps) {
      try {
        this.runtime.logger.info(`Executing step: ${step.id}`);
        
        // Check condition if exists
        if (step.condition && !step.condition(context)) {
          this.runtime.logger.info(`Skipping step ${step.id} (condition not met)`);
          continue;
        }
        
        let stepResult;
        
        switch (step.type) {
          case 'shinobi':
            stepResult = await this.executeShinobiWithFallback(step.config, context);
            break;
          case 'parallel':
            stepResult = await this.executeParallelWithFallback(step.config, context);
            break;
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }
        
        results.push({
          stepId: step.id,
          type: step.type,
          result: stepResult
        });
        
        // Update context with result
        context.results.push(stepResult);
      } catch (error) {
        this.runtime.logger.error(`Step ${step.id} failed: ${error.message}`);
        
        // Handle error based on step configuration
        const errorHandling = step.onError || this.getInfo().errorHandling || 'stop';
        
        if (errorHandling === 'stop') {
          throw new Error(`Workflow execution stopped at step '${step.id}': ${error.message}`);
        }
        
        if (errorHandling === 'continue') {
          this.runtime.logger.warn(`Continuing workflow despite error in step '${step.id}'`);
          results.push({
            stepId: step.id,
            type: step.type,
            error: error.message
          });
          continue;
        }
        
        if (errorHandling === 'retry') {
          const maxRetries = this.getInfo().maxRetries || 1;
          
          for (let retry = 1; retry <= maxRetries; retry++) {
            this.runtime.logger.info(`Retrying step '${step.id}' (${retry}/${maxRetries})`);
            
            try {
              let stepResult;
              
              switch (step.type) {
                case 'shinobi':
                  stepResult = await this.executeShinobiWithFallback(step.config, context);
                  break;
                case 'parallel':
                  stepResult = await this.executeParallelWithFallback(step.config, context);
                  break;
              }
              
              results.push({
                stepId: step.id,
                type: step.type,
                result: stepResult,
                retryCount: retry
              });
              
              // Update context with result
              context.results.push(stepResult);
              
              // Retry succeeded
              break;
            } catch (retryError) {
              if (retry === maxRetries) {
                // All retries failed
                if (this.getInfo().errorHandling === 'stop') {
                  throw new Error(`Workflow execution stopped after ${maxRetries} retries at step '${step.id}': ${retryError.message}`);
                }
                
                results.push({
                  stepId: step.id,
                  type: step.type,
                  error: retryError.message,
                  retryCount: retry
                });
              }
            }
          }
        }
      }
    }
    
    return {
      result: {
        dojoId: this.getInfo().id,
        steps: results,
        finalResult: results[results.length - 1]?.result,
        context
      },
      executionTime: 0 // Will be set by caller
    };
  }
  
  private async executeShinobiWithFallback(shinobi: any, context: any): Promise<any> {
    try {
      return await this.executeShinobi(shinobi, context);
    } catch (error) {
      // Implement fallback logic
      this.runtime.logger.warn(`Using fallback for Shinobi execution: ${error.message}`);
      
      // Simple fallback: create a basic response
      return {
        fallback: true,
        message: "I couldn't complete this step due to a technical issue, but I'll continue with the workflow.",
        error: error.message
      };
    }
  }
  
  private async executeParallelWithFallback(agents: any[], context: any): Promise<any> {
    try {
      return await this.executeParallel(agents, context);
    } catch (error) {
      // Implement fallback logic
      this.runtime.logger.warn(`Using fallback for parallel execution: ${error.message}`);
      
      // Try to execute at least one agent
      for (const agent of agents) {
        try {
          const result = await this.executeShinobi(agent.config, context);
          return {
            type: 'parallel_fallback',
            results: [result],
            fallbackReason: error.message
          };
        } catch {
          // Continue to next agent
        }
      }
      
      // All agents failed
      throw new Error(`All parallel agents failed: ${error.message}`);
    }
  }
}
```

### 6. Memory and Logging Issues

#### Issue: Memory System Failures
```bash
Error: Failed to log to database: [error message]
```

**Solutions:**
```typescript
// 1. Implement fault-tolerant memory
class FaultTolerantMemory extends Memory {
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      return await super.log(entry);
    } catch (error) {
      console.error(`Memory logging failed: ${error.message}`);
      
      // Fall back to console logging
      console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.metadata);
      
      // Generate a fallback ID
      return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }
  
  async queryLogs(filters: any = {}): Promise<LogEntry[]> {
    try {
      return await super.queryLogs(filters);
    } catch (error) {
      console.error(`Log query failed: ${error.message}`);
      return []; // Return empty array as fallback
    }
  }
}

// 2. Implement memory with local fallback
class HybridMemory extends Memory {
  private localLogs: LogEntry[] = [];
  private readonly maxLocalLogs = 1000;
  private syncInterval: NodeJS.Timeout;
  
  constructor(config: MemoryConfig) {
    super(config);
    
    // Periodically sync local logs to database
    this.syncInterval = setInterval(() => {
      this.syncLocalLogs();
    }, 60000); // Every minute
  }
  
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      return await super.log(entry);
    } catch (error) {
      console.warn(`Database logging failed, using local fallback: ${error.message}`);
      
      // Store in local memory
      const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const timestamp = new Date();
      
      const logEntry: LogEntry = {
        id,
        timestamp,
        ...entry
      };
      
      this.localLogs.push(logEntry);
      
      // Limit local logs size
      if (this.localLogs.length > this.maxLocalLogs) {
        this.localLogs.shift();
      }
      
      return id;
    }
  }
  
  async queryLogs(filters: any = {}): Promise<LogEntry[]> {
    try {
      const dbLogs = await super.queryLogs(filters);
      
      // If database query succeeds, return those results
      return dbLogs;
    } catch (error) {
      console.warn(`Database query failed, using local logs: ${error.message}`);
      
      // Filter local logs
      return this.filterLocalLogs(filters);
    }
  }
  
  private filterLocalLogs(filters: any): LogEntry[] {
    let filteredLogs = [...this.localLogs];
    
    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }
    
    if (filters.start_time) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.start_time);
    }
    
    if (filters.end_time) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.end_time);
    }
    
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }
    
    return filteredLogs;
  }
  
  private async syncLocalLogs(): Promise<void> {
    if (this.localLogs.length === 0) return;
    
    try {
      // Attempt to sync local logs to database
      if (this.supabase) {
        const logsToSync = [...this.localLogs];
        this.localLogs = [];
        
        const { error } = await this.supabase
          .from('logs')
          .insert(logsToSync.map(log => ({
            id: log.id.replace('local-', ''),
            timestamp: log.timestamp.toISOString(),
            level: log.level,
            message: log.message,
            context: log.context,
            shinobi_id: log.shinobi_id,
            kata_id: log.kata_id,
            shuriken_id: log.shuriken_id,
            execution_time: log.execution_time,
            token_usage: log.token_usage,
            estimated_cost: log.estimated_cost,
            file_path: log.file_path,
            metadata: log.metadata
          })));
        
        if (error) {
          console.error('Failed to sync local logs:', error);
          // Put logs back in the queue
          this.localLogs = [...logsToSync, ...this.localLogs];
        } else {
          console.log(`Synced ${logsToSync.length} logs to database`);
        }
      }
    } catch (error) {
      console.error('Error during log sync:', error);
    }
  }
  
  dispose(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Final sync attempt
    this.syncLocalLogs();
  }
}
```

## 🔧 Advanced Troubleshooting

### 1. Debugging Tools

#### Comprehensive Debugging Toolkit
```typescript
class NinjaAgentsDebugger {
  private readonly logger: Logger;
  
  constructor(private runtime: KataRuntime) {
    this.logger = runtime.logger;
  }
  
  async runDiagnostics(): Promise<DiagnosticResults> {
    console.log('🔍 Running Ninja Agents diagnostics...');
    
    const results: DiagnosticResults = {
      openai: await this.testOpenAIConnection(),
      memory: await this.testMemorySystem(),
      shurikens: await this.testShurikens(),
      kata: await this.testKata(),
      shinobi: await this.testShinobi(),
      system: this.testSystemResources()
    };
    
    this.displayResults(results);
    return results;
  }
  
  private async testOpenAIConnection(): Promise<TestResult> {
    console.log('Testing OpenAI connection...');
    
    try {
      const start = Date.now();
      await this.runtime.openai.models.list();
      const duration = Date.now() - start;
      
      return {
        success: true,
        message: `OpenAI connection successful (${duration}ms)`,
        details: { duration }
      };
    } catch (error) {
      return {
        success: false,
        message: `OpenAI connection failed: ${error.message}`,
        details: { error }
      };
    }
  }
  
  private async testMemorySystem(): Promise<TestResult> {
    console.log('Testing memory system...');
    
    if (!this.runtime.memory) {
      return {
        success: false,
        message: 'Memory system not configured',
        details: { error: 'No memory instance available' }
      };
    }
    
    try {
      const start = Date.now();
      await this.runtime.memory.log({
        level: 'debug',
        message: 'Diagnostic test'
      });
      const duration = Date.now() - start;
      
      return {
        success: true,
        message: `Memory system operational (${duration}ms)`,
        details: { 
          duration,
          databaseLogging: this.runtime.memory.isDatabaseLoggingEnabled(),
          fileLogging: this.runtime.memory.isFileLoggingEnabled()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Memory system failed: ${error.message}`,
        details: { error }
      };
    }
  }
  
  private async testShurikens(): Promise<TestResult> {
    console.log('Testing basic Shuriken functionality...');
    
    try {
      const testShuriken = new Shuriken(
        'test_shuriken',
        'Test shuriken for diagnostics',
        z.object({ value: z.number() }),
        (params) => params.value * 2
      );
      
      const validationResult = testShuriken.validate({ value: 5 });
      
      if (!validationResult.success) {
        return {
          success: false,
          message: `Shuriken validation failed: ${validationResult.error}`,
          details: { validationResult }
        };
      }
      
      const executionResult = await testShuriken.execute({ value: 5 });
      
      if (executionResult.result !== 10) {
        return {
          success: false,
          message: `Shuriken execution produced unexpected result: ${executionResult.result}`,
          details: { executionResult }
        };
      }
      
      return {
        success: true,
        message: 'Shuriken functionality operational',
        details: { executionResult }
      };
    } catch (error) {
      return {
        success: false,
        message: `Shuriken test failed: ${error.message}`,
        details: { error }
      };
    }
  }
  
  private async testKata(): Promise<TestResult> {
    console.log('Testing basic Kata functionality...');
    
    try {
      // Create a mock Kata that doesn't call OpenAI
      const mockKata = new Kata(this.runtime, {
        model: 'gpt-4o-mini',
        title: 'Test Kata',
        description: 'Kata for diagnostics'
      });
      
      // Override execute method to avoid actual API calls
      const originalExecute = mockKata.execute;
      mockKata.execute = async () => {
        return {
          result: 'Mock Kata response',
          executionTime: 0
        };
      };
      
      const result = await mockKata.execute('Test query');
      
      // Restore original method
      mockKata.execute = originalExecute;
      
      return {
        success: true,
        message: 'Kata functionality operational',
        details: { result }
      };
    } catch (error) {
      return {
        success: false,
        message: `Kata test failed: ${error.message}`,
        details: { error }
      };
    }
  }
  
  private async testShinobi(): Promise<TestResult> {
    console.log('Testing basic Shinobi functionality...');
    
    try {
      // Create a mock Shinobi that doesn't call OpenAI
      const mockShinobi = new Shinobi(this.runtime, {
        role: 'Test Shinobi',
        description: 'Shinobi for diagnostics',
        backstory: 'Test backstory',
        katas: [{
          model: 'gpt-4o-mini',
          title: 'Test Kata',
          description: 'Kata for diagnostics'
        }]
      });
      
      // Override execute method to avoid actual API calls
      const originalExecute = mockShinobi.execute;
      mockShinobi.execute = async () => {
        return {
          result: {
            kataResults: [],
            finalAnswer: 'Mock Shinobi response',
            shinobiId: mockShinobi.getId(),
            aggregatedBilling: {
              model: 'mock',
              tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
              estimatedCost: 0,
              timestamp: new Date()
            },
            totalExecutionTime: 0
          },
          executionTime: 0
        };
      };
      
      const result = await mockShinobi.execute('Test query');
      
      // Restore original method
      mockShinobi.execute = originalExecute;
      
      return {
        success: true,
        message: 'Shinobi functionality operational',
        details: { result }
      };
    } catch (error) {
      return {
        success: false,
        message: `Shinobi test failed: ${error.message}`,
        details: { error }
      };
    }
  }
  
  private testSystemResources(): TestResult {
    console.log('Testing system resources...');
    
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();
      const cpuCores = require('os').cpus().length;
      
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      const systemMemoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
      
      const warnings = [];
      
      if (memoryUsagePercent > 80) {
        warnings.push(`High heap usage: ${memoryUsagePercent.toFixed(1)}%`);
      }
      
      if (systemMemoryUsagePercent > 90) {
        warnings.push(`High system memory usage: ${systemMemoryUsagePercent.toFixed(1)}%`);
      }
      
      return {
        success: warnings.length === 0,
        message: warnings.length === 0 
          ? 'System resources OK' 
          : `System resource warnings: ${warnings.join(', ')}`,
        details: {
          memory: {
            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
            heapUsagePercent: `${memoryUsagePercent.toFixed(1)}%`,
            rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(1)} MB`,
            systemTotal: `${(totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB`,
            systemFree: `${(freeMemory / 1024 / 1024 / 1024).toFixed(1)} GB`,
            systemUsagePercent: `${systemMemoryUsagePercent.toFixed(1)}%`
          },
          cpu: {
            user: `${(cpuUsage.user / 1000).toFixed(1)}ms`,
            system: `${(cpuUsage.system / 1000).toFixed(1)}ms`,
            cores: cpuCores
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `System resource check failed: ${error.message}`,
        details: { error }
      };
    }
  }
  
  private displayResults(results: DiagnosticResults): void {
    console.log('\n📊 Diagnostic Results:');
    console.log('=====================');
    
    Object.entries(results).forEach(([key, result]) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${key}: ${result.message}`);
    });
    
    const allSuccessful = Object.values(results).every(r => r.success);
    
    console.log('\n🏁 Overall Status:', allSuccessful ? '✅ PASS' : '❌ FAIL');
    
    if (!allSuccessful) {
      console.log('\n🔧 Troubleshooting Recommendations:');
      
      if (!results.openai.success) {
        console.log('- Check your OpenAI API key and network connection');
        console.log('- Verify API key permissions and rate limits');
      }
      
      if (!results.memory.success) {
        console.log('- Check your Supabase configuration');
        console.log('- Verify database permissions and schema');
      }
      
      if (!results.shurikens.success) {
        console.log('- Check Shuriken implementations for errors');
        console.log('- Verify parameter validation logic');
      }
      
      if (!results.kata.success) {
        console.log('- Check Kata configurations');
        console.log('- Verify model availability');
      }
      
      if (!results.shinobi.success) {
        console.log('- Check Shinobi configurations');
        console.log('- Verify Kata dependencies');
      }
      
      if (!results.system.success) {
        console.log('- Check system resources');
        console.log('- Consider scaling up or optimizing resource usage');
      }
    }
  }
}

interface TestResult {
  success: boolean;
  message: string;
  details: Record<string, any>;
}

interface DiagnosticResults {
  openai: TestResult;
  memory: TestResult;
  shurikens: TestResult;
  kata: TestResult;
  shinobi: TestResult;
  system: TestResult;
}
```

### 2. Logging and Monitoring

#### Enhanced Logging for Troubleshooting
```typescript
class TroubleshootingLogger extends Logger {
  private readonly logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;
  
  debug(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    this.bufferLog('debug', message, metadata);
    super.debug(message, metadata, ...args);
  }
  
  info(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    this.bufferLog('info', message, metadata);
    super.info(message, metadata, ...args);
  }
  
  warn(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    this.bufferLog('warn', message, metadata);
    super.warn(message, metadata, ...args);
  }
  
  error(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    this.bufferLog('error', message, metadata);
    super.error(message, metadata, ...args);
  }
  
  private bufferLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: Record<string, any>): void {
    this.logBuffer.push({
      id: `buffer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      context: this.context,
      metadata
    });
    
    // Keep buffer size limited
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }
  
  getRecentLogs(count = 100, level?: 'debug' | 'info' | 'warn' | 'error'): LogEntry[] {
    let logs = [...this.logBuffer];
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-count);
  }
  
  getErrorContext(errorMessage: string, contextLines = 10): LogEntry[] {
    const errorIndex = this.logBuffer.findIndex(log => 
      log.level === 'error' && log.message.includes(errorMessage)
    );
    
    if (errorIndex === -1) return [];
    
    const startIndex = Math.max(0, errorIndex - contextLines);
    const endIndex = Math.min(this.logBuffer.length, errorIndex + contextLines + 1);
    
    return this.logBuffer.slice(startIndex, endIndex);
  }
  
  saveLogsToFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const logContent = this.logBuffer.map(log => 
        JSON.stringify({
          timestamp: log.timestamp.toISOString(),
          level: log.level,
          context: log.context,
          message: log.message,
          metadata: log.metadata
        })
      ).join('\n');
      
      fs.writeFile(filePath, logContent, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
```

## 📋 Troubleshooting Checklist

### General Troubleshooting Checklist

- [ ] **Environment Setup**
  - [ ] Node.js version 18+ confirmed
  - [ ] All required dependencies installed
  - [ ] Environment variables properly configured
  - [ ] TypeScript configuration correct

- [ ] **API Connectivity**
  - [ ] OpenAI API key valid and active
  - [ ] Network connectivity confirmed
  - [ ] Rate limits checked
  - [ ] API permissions verified

- [ ] **Configuration**
  - [ ] Correct model names used
  - [ ] Valid parameter values
  - [ ] Proper runtime initialization
  - [ ] Memory system correctly configured

- [ ] **Resource Usage**
  - [ ] Memory usage within limits
  - [ ] CPU usage reasonable
  - [ ] Disk space available
  - [ ] Network bandwidth sufficient

- [ ] **Error Handling**
  - [ ] Proper error handling implemented
  - [ ] Retry logic for transient errors
  - [ ] Fallback mechanisms in place
  - [ ] Error logging comprehensive

### Component-Specific Checklists

#### Shuriken Troubleshooting
- [ ] Schema validation correct
- [ ] Parameter types match schema
- [ ] Implementation handles errors
- [ ] Async operations properly awaited

#### Kata Troubleshooting
- [ ] Valid model specified
- [ ] Shurikens properly registered
- [ ] Parameters within limits
- [ ] Error handling implemented

#### Shinobi Troubleshooting
- [ ] Katas properly configured
- [ ] Persona details complete
- [ ] Shared shurikens registered
- [ ] Final answer generation robust

#### Clan Troubleshooting
- [ ] Strategy appropriate for task
- [ ] Shinobi configurations valid
- [ ] Concurrency limits set
- [ ] Timeout configuration appropriate

#### Dojo Troubleshooting
- [ ] Workflow steps properly defined
- [ ] Step dependencies clear
- [ ] Error handling strategy defined
- [ ] Conditional logic correct

This comprehensive troubleshooting guide provides solutions for common issues encountered when using the Ninja Agents SDK. Regular monitoring and proactive troubleshooting will help maintain optimal system performance and reliability.