import { randomUUID } from 'crypto';
import { ThoughtModule } from './ThoughtModule.js';
import { ThoughtGraph } from './ThoughtGraph.js';
import { ThoughtMemory } from './ThoughtMemory.js';
import { ThoughtTrace } from './ThoughtTrace.js';
import { PromptExecutor } from '../prompts/PromptExecutor.js';
import type { ThoughtContext, ThoughtResult } from '../types.js';
import OpenAI from 'openai';

/**
 * Orchestrates execution of ThoughtModules and ThoughtGraphs.
 * Provides the main runtime environment for the ThoughtSystem.
 */
export class ThoughtRuntime {
  private executor: PromptExecutor;
  private memory: ThoughtMemory;
  private trace: ThoughtTrace;
  private runtimeId: string;

  constructor(openai: OpenAI, model: string = 'gpt-4o-mini') {
    this.executor = new PromptExecutor(openai, model);
    this.memory = new ThoughtMemory();
    this.trace = new ThoughtTrace();
    this.runtimeId = randomUUID();
  }

  /**
   * Execute a single ThoughtModule
   */
  async run(module: ThoughtModule, input: any, scope: string = 'default'): Promise<ThoughtResult> {
    const context: ThoughtContext = {
      input,
      memory: this.memory.read(scope),
      trace: this.trace.getTrace(),
      metadata: {
        runtimeId: this.runtimeId,
        scope
      }
    };

    const result = await module.think(context);

    // Update memory and trace
    this.memory.write(scope, `${module.getInfo().name}_result`, result.output);
    this.trace.addTrace(result.trace);

    return result;
  }

  /**
   * Execute a ThoughtGraph
   */
  async executeGraph(
    graph: ThoughtGraph, 
    input: any, 
    scope: string = 'default'
  ): Promise<ThoughtResult[]> {
    // Validate graph before execution
    const validation = graph.validate();
    if (!validation.valid) {
      throw new Error(`Invalid ThoughtGraph: ${validation.errors.join(', ')}`);
    }

    const context: ThoughtContext = {
      input,
      memory: this.memory.read(scope),
      trace: this.trace.getTrace(),
      metadata: {
        runtimeId: this.runtimeId,
        scope,
        graphExecution: true
      }
    };

    const results = await graph.execute(context);

    // Update memory with all results
    results.forEach((result, index) => {
      this.memory.write(scope, `graph_result_${index}`, result.output);
      this.trace.addTrace(result.trace);
    });

    return results;
  }

  /**
   * Create a new ThoughtModule with this runtime's executor
   */
  createModule(config: any): ThoughtModule {
    return new ThoughtModule(config, this.executor);
  }

  /**
   * Get runtime statistics
   */
  getStats() {
    return {
      runtimeId: this.runtimeId,
      memoryScopes: this.memory.getScopes(),
      traceCount: this.trace.getTrace().length,
      totalExecutions: this.trace.getTrace().length
    };
  }

  /**
   * Clear runtime state
   */
  clear(scope?: string): void {
    if (scope) {
      this.memory.clear(scope);
    } else {
      this.memory.clearAll();
      this.trace.clear();
    }
  }

  /**
   * Export runtime state for debugging
   */
  export() {
    return {
      runtimeId: this.runtimeId,
      memory: this.memory.export(),
      trace: this.trace.export(),
      stats: this.getStats()
    };
  }
}