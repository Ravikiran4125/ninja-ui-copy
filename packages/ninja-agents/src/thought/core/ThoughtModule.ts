import { randomUUID } from 'crypto';
import { z } from 'zod';
import type { 
  ThoughtModuleConfig, 
  ThoughtContext, 
  ThoughtResult, 
  ExecutionTrace 
} from '../types.js';
import { PromptTemplate } from '../prompts/PromptTemplate.js';
import { PromptStrategy } from '../prompts/PromptStrategy.js';
import { PromptExecutor } from '../prompts/PromptExecutor.js';

/**
 * Core abstraction for reasoning modules in the ThoughtSystem.
 * Each ThoughtModule represents a single reasoning step that can be
 * composed into complex cognitive workflows.
 */
export class ThoughtModule {
  private config: ThoughtModuleConfig;
  private template: PromptTemplate;
  private strategies: PromptStrategy[];
  private executor: PromptExecutor;
  private moduleId: string;

  constructor(config: ThoughtModuleConfig, executor: PromptExecutor) {
    this.config = config;
    this.moduleId = randomUUID();
    this.template = new PromptTemplate(config.template);
    this.strategies = (config.strategies || []).map(s => new PromptStrategy(s));
    this.executor = executor;
  }

  /**
   * Execute the thought module with given context
   */
  async think(context: ThoughtContext): Promise<ThoughtResult> {
    const startTime = Date.now();
    const traceId = randomUUID();

    try {
      // Render the prompt template with context
      const prompt = this.template.render({
        ...context.input,
        ...context.memory,
        ...context.metadata
      });

      // Apply reasoning strategies
      let enhancedPrompt = prompt;
      let reasoning = '';

      for (const strategy of this.strategies) {
        const result = await strategy.apply(enhancedPrompt, context);
        enhancedPrompt = result.prompt;
        reasoning += result.reasoning || '';
      }

      // Execute the prompt
      const executionResult = await this.executor.execute({
        prompt: enhancedPrompt,
        schema: this.config.schema,
        maxRetries: this.config.maxRetries || 1,
        timeout: this.config.timeout
      });

      const executionTime = Date.now() - startTime;

      // Create execution trace
      const trace: ExecutionTrace = {
        id: traceId,
        moduleId: this.moduleId,
        timestamp: new Date(),
        input: context.input,
        output: executionResult.result,
        reasoning,
        strategy: this.strategies.map(s => s.getType()).join(', '),
        executionTime,
        tokenUsage: executionResult.tokenUsage
      };

      return {
        output: executionResult.result,
        reasoning,
        confidence: this.calculateConfidence(executionResult),
        tokenUsage: executionResult.tokenUsage,
        billingInfo: executionResult.billingInfo,
        executionTime,
        trace
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const trace: ExecutionTrace = {
        id: traceId,
        moduleId: this.moduleId,
        timestamp: new Date(),
        input: context.input,
        output: null,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      throw new Error(`ThoughtModule execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get planning hint for UI/workflow prediction
   */
  plan(): { estimatedTime: number; complexity: 'low' | 'medium' | 'high' } {
    const strategyCount = this.strategies.length;
    const hasSchema = !!this.config.schema;
    
    let complexity: 'low' | 'medium' | 'high' = 'low';
    let estimatedTime = 1000; // Base 1 second

    if (strategyCount > 2 || hasSchema) complexity = 'medium';
    if (strategyCount > 4) complexity = 'high';

    estimatedTime += strategyCount * 500; // 500ms per strategy
    if (hasSchema) estimatedTime += 1000; // Extra time for validation

    return { estimatedTime, complexity };
  }

  /**
   * Calculate confidence score based on execution result
   */
  private calculateConfidence(result: any): number {
    // Simple confidence calculation - can be enhanced
    if (result.error) return 0;
    if (this.config.schema && result.result) return 0.9;
    return 0.7;
  }

  /**
   * Get module information
   */
  getInfo() {
    return {
      id: this.moduleId,
      name: this.config.name,
      description: this.config.description,
      strategies: this.strategies.map(s => s.getType()),
      hasSchema: !!this.config.schema
    };
  }
}