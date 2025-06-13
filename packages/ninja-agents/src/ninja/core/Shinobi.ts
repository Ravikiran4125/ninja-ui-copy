import { Shinobi as CoreShinobi } from '../../core/shinobi.js';
import { ThoughtRuntime } from '../../thought/core/ThoughtRuntime.js';
import { ThoughtModule } from '../../thought/core/ThoughtModule.js';
import { PromptExecutor } from '../../thought/prompts/PromptExecutor.js';
import type { ShinobiConfig } from '../types.js';
import type { KataRuntime } from '../../core/kataRuntime.js';
import type { ExecutionResult } from '../../core/types.js';

/**
 * Enhanced Shinobi with ThoughtSystem integration.
 * Extends the core Shinobi with advanced reasoning capabilities.
 */
export class Shinobi extends CoreShinobi {
  private thoughtRuntime?: ThoughtRuntime;
  private thoughtModules: ThoughtModule[] = [];

  constructor(runtime: KataRuntime, config: ShinobiConfig) {
    // Convert enhanced config to core config
    const coreConfig = {
      role: config.role,
      description: config.description,
      backstory: config.backstory,
      katas: config.katas.map(kata => ({
        ...kata,
        // Remove thoughtModule from kata config for core compatibility
        thoughtModule: undefined
      })),
      shurikens: config.shurikens
    };

    super(runtime, coreConfig);

    // Initialize ThoughtSystem if thought modules are provided
    if (config.thoughtModules && config.thoughtModules.length > 0) {
      this.thoughtRuntime = new ThoughtRuntime(runtime.openai);
      this.thoughtModules = config.thoughtModules.map(moduleConfig => 
        this.thoughtRuntime!.createModule(moduleConfig)
      );
    }
  }

  /**
   * Enhanced execute with ThoughtSystem integration
   */
  async execute(userQuery: string): Promise<ExecutionResult<any>> {
    // If we have thought modules, use enhanced reasoning
    if (this.thoughtRuntime && this.thoughtModules.length > 0) {
      return await this.executeWithThoughtSystem(userQuery);
    }

    // Otherwise, use standard execution
    return await super.execute(userQuery);
  }

  /**
   * Execute with ThoughtSystem for advanced reasoning
   */
  private async executeWithThoughtSystem(userQuery: string): Promise<ExecutionResult<any>> {
    const startTime = Date.now();

    try {
      // First, run thought modules for enhanced reasoning
      const thoughtResults = [];
      for (const module of this.thoughtModules) {
        const result = await this.thoughtRuntime!.run(module, userQuery);
        thoughtResults.push(result);
      }

      // Synthesize thought results into enhanced context
      const enhancedContext = this.synthesizeThoughtResults(userQuery, thoughtResults);

      // Execute standard Shinobi workflow with enhanced context
      const shinobiResult = await super.execute(enhancedContext);

      const executionTime = Date.now() - startTime;

      return {
        ...shinobiResult,
        result: {
          ...shinobiResult.result,
          thoughtResults,
          enhancedReasoning: true
        },
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      throw new Error(`Enhanced Shinobi execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Synthesize thought results into enhanced context
   */
  private synthesizeThoughtResults(originalQuery: string, thoughtResults: any[]): string {
    if (thoughtResults.length === 0) {
      return originalQuery;
    }

    const reasoningInsights = thoughtResults.map((result, index) => 
      `Reasoning Module ${index + 1}: ${result.reasoning || 'No specific reasoning provided'}\nOutput: ${JSON.stringify(result.output)}`
    ).join('\n\n');

    return `Original Query: ${originalQuery}

Advanced Reasoning Analysis:
${reasoningInsights}

Enhanced Context: Based on the advanced reasoning analysis above, please provide a comprehensive response that incorporates these insights while addressing the original query.`;
  }

  /**
   * Get enhanced information including thought modules
   */
  getEnhancedInfo() {
    const baseInfo = super.getConfig();
    return {
      ...baseInfo,
      hasThoughtSystem: !!this.thoughtRuntime,
      thoughtModuleCount: this.thoughtModules.length,
      thoughtModules: this.thoughtModules.map(module => module.getInfo())
    };
  }
}