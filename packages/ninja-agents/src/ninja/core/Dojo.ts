import { randomUUID } from 'crypto';
import type { DojoConfig, DojoStep } from '../types';
import { Shinobi } from './Shinobi';
import { Clan } from './Clan';
import { KataRuntime } from '../../core/kataRuntime';
import type { ExecutionResult } from '../../core/types';

/**
 * Workflow orchestration system with fluent API.
 * Enables complex agent workflows with conditional branching and parallel execution.
 */
export class Dojo {
  private steps: DojoStep[] = [];
  private dojoId: string;
  private runtime: KataRuntime;
  private config: Partial<DojoConfig>;

  constructor(runtime: KataRuntime, config: Partial<DojoConfig> = {}) {
    this.runtime = runtime;
    this.config = config;
    this.dojoId = randomUUID();
  }

  /**
   * Start the workflow with a shinobi or clan
   */
  start(agent: Shinobi | Clan | any): Dojo {
    this.steps.push({
      id: randomUUID(),
      type: agent instanceof Shinobi ? 'shinobi' : agent instanceof Clan ? 'clan' : 'shinobi',
      config: agent
    });
    return this;
  }

  /**
   * Add a sequential step
   */
  then(agent: Shinobi | Clan | any): Dojo {
    this.steps.push({
      id: randomUUID(),
      type: agent instanceof Shinobi ? 'shinobi' : agent instanceof Clan ? 'clan' : 'shinobi',
      config: agent
    });
    return this;
  }

  /**
   * Add parallel execution steps
   */
  parallel(agents: (Shinobi | Clan | any)[]): Dojo {
    this.steps.push({
      id: randomUUID(),
      type: 'parallel',
      config: agents.map(agent => ({
        type: agent instanceof Shinobi ? 'shinobi' : agent instanceof Clan ? 'clan' : 'shinobi',
        config: agent
      }))
    });
    return this;
  }

  /**
   * Add conditional step
   */
  if(condition: (context: any) => boolean, agent: Shinobi | Clan | any): Dojo {
    this.steps.push({
      id: randomUUID(),
      type: agent instanceof Shinobi ? 'shinobi' : agent instanceof Clan ? 'clan' : 'shinobi',
      config: agent,
      condition
    });
    return this;
  }

  /**
   * Add else step (follows the last conditional)
   */
  else(agent: Shinobi | Clan | any): Dojo {
    // Find the last conditional step and add else logic
    const lastStep = this.steps[this.steps.length - 1];
    if (lastStep && lastStep.condition) {
      // Create a new step that executes when the condition is false
      this.steps.push({
        id: randomUUID(),
        type: agent instanceof Shinobi ? 'shinobi' : agent instanceof Clan ? 'clan' : 'shinobi',
        config: agent,
        condition: (context: any) => !lastStep.condition!(context)
      });
    }
    return this;
  }

  /**
   * Execute the workflow
   */
  async execute(userQuery: string): Promise<ExecutionResult<any>> {
    const startTime = Date.now();
    const results = [];
    let context = { query: userQuery, results: [] };

    try {
      for (const step of this.steps) {
        // Check condition if exists
        if (step.condition && !step.condition(context)) {
          continue;
        }

        let stepResult;

        switch (step.type) {
          case 'shinobi':
            stepResult = await this.executeShuriken(step.config, context);
            break;
          case 'clan':
            stepResult = await this.executeClan(step.config, context);
            break;
          case 'parallel':
            stepResult = await this.executeParallel(step.config, context);
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
      }

      const executionTime = Date.now() - startTime;

      return {
        result: {
          dojoId: this.dojoId,
          steps: results,
          finalResult: results[results.length - 1]?.result,
          context
        },
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      if (this.config.errorHandling === 'continue') {
        return {
          result: {
            dojoId: this.dojoId,
            steps: results,
            error: error instanceof Error ? error.message : 'Unknown error',
            context
          },
          executionTime
        };
      }

      throw new Error(`Dojo execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a shinobi step
   */
  private async executeShuriken(shinobi: Shinobi, context: any): Promise<any> {
    // Use the latest context or original query
    const query = context.results.length > 0 
      ? context.results[context.results.length - 1].result?.finalAnswer || context.query
      : context.query;

    return await shinobi.execute(query);
  }

  /**
   * Execute a clan step
   */
  private async executeClan(clan: Clan, context: any): Promise<any> {
    const query = context.results.length > 0 
      ? context.results[context.results.length - 1].result?.finalAnswer || context.query
      : context.query;

    return await clan.execute(query);
  }

  /**
   * Execute parallel steps
   */
  private async executeParallel(agents: any[], context: any): Promise<any> {
    const query = context.results.length > 0 
      ? context.results[context.results.length - 1].result?.finalAnswer || context.query
      : context.query;

    const promises = agents.map(async (agentConfig) => {
      if (agentConfig.type === 'shinobi') {
        return await agentConfig.config.execute(query);
      } else if (agentConfig.type === 'clan') {
        return await agentConfig.config.execute(query);
      }
      throw new Error(`Unknown agent type in parallel execution: ${agentConfig.type}`);
    });

    const results = await Promise.all(promises);

    return {
      type: 'parallel',
      results,
      synthesis: this.synthesizeParallelResults(results)
    };
  }

  /**
   * Synthesize results from parallel execution
   */
  private synthesizeParallelResults(results: any[]): string {
    const summaries = results.map((result, index) => 
      `Agent ${index + 1}: ${result.result?.finalAnswer || result.finalAnswer || 'No result'}`
    );

    return `Parallel execution synthesis:\n${summaries.join('\n\n')}`;
  }

  /**
   * Get workflow information
   */
  getInfo() {
    return {
      id: this.dojoId,
      name: this.config.name,
      description: this.config.description,
      stepCount: this.steps.length,
      steps: this.steps.map(step => ({
        id: step.id,
        type: step.type,
        hasCondition: !!step.condition
      }))
    };
  }

  /**
   * Validate workflow structure
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Check for orphaned else steps
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step.condition && i > 0) {
        const prevStep = this.steps[i - 1];
        if (!prevStep.condition) {
          // This might be an else step, which is valid
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear all steps
   */
  clear(): Dojo {
    this.steps = [];
    return this;
  }
}