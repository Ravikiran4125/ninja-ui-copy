import { Kata as CoreKata } from '../../core/kata';
import { ThoughtModule } from '../../thought/core/ThoughtModule';
import { PromptExecutor } from '../../thought/prompts/PromptExecutor';
import type { KataConfig } from '../types';
import type { KataRuntime } from '../../core/kataRuntime';
import type { ExecutionResult } from '../../core/types';

/**
 * Enhanced Kata with ThoughtSystem integration.
 * Extends the core Kata with advanced reasoning capabilities.
 */
export class Kata extends CoreKata {
  private thoughtModule?: ThoughtModule;

  constructor(runtime: KataRuntime, config: KataConfig) {
    // Convert enhanced config to core config
    const coreConfig = {
      ...config,
      // Remove thoughtModule from config for core compatibility
      thoughtModule: undefined
    };

    super(runtime, coreConfig);

    // Initialize ThoughtModule if provided
    if (config.thoughtModule) {
      const executor = new PromptExecutor(runtime.openai, config.model);
      this.thoughtModule = new ThoughtModule(config.thoughtModule, executor);
    }
  }

  /**
   * Enhanced execute with ThoughtSystem integration
   */
  async execute(userQuery: string): Promise<ExecutionResult<string | any>> {
    // If we have a thought module, use enhanced reasoning
    if (this.thoughtModule) {
      return await this.executeWithThoughtSystem(userQuery);
    }

    // Otherwise, use standard execution
    return await super.execute(userQuery);
  }

  /**
   * Execute with ThoughtSystem for advanced reasoning
   */
  private async executeWithThoughtSystem(userQuery: string): Promise<ExecutionResult<string | any>> {
    const startTime = Date.now();

    try {
      // First, run thought module for enhanced reasoning
      const thoughtResult = await this.thoughtModule!.think({
        input: userQuery,
        memory: {},
        trace: [],
        metadata: {}
      });

      // Use thought result to enhance the kata execution
      const enhancedQuery = this.enhanceQueryWithThought(userQuery, thoughtResult);

      // Execute standard Kata workflow with enhanced query
      const kataResult = await super.execute(enhancedQuery);

      const executionTime = Date.now() - startTime;

      return {
        ...kataResult,
        result: {
          standardResult: kataResult.result,
          thoughtResult: thoughtResult.output,
          reasoning: thoughtResult.reasoning,
          enhancedReasoning: true
        },
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      throw new Error(`Enhanced Kata execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhance query with thought result
   */
  private enhanceQueryWithThought(originalQuery: string, thoughtResult: any): string {
    return `Original Query: ${originalQuery}

Advanced Reasoning: ${thoughtResult.reasoning || 'No specific reasoning provided'}

Thought Analysis: ${JSON.stringify(thoughtResult.output)}

Enhanced Request: Please provide a comprehensive response that incorporates the advanced reasoning and thought analysis above while addressing the original query.`;
  }

  /**
   * Get enhanced information including thought module
   */
  getEnhancedInfo() {
    const baseInfo = super.getConfig();
    return {
      ...baseInfo,
      hasThoughtModule: !!this.thoughtModule,
      thoughtModule: this.thoughtModule?.getInfo()
    };
  }
}