import { randomUUID } from 'crypto';
import { Logger } from '../utils/Logger';
import { KataRuntime } from './kataRuntime';
import { Kata, KataConfig } from './kata';
import { Shuriken } from './shuriken';
import type { ExecutionResult, BillingInfo, ShinobiPersonaContext } from './types';
import { formatCost } from '../utils/billingCalculator';

/**
 * Configuration interface for creating a Shinobi instance.
 * Defines the persona, expertise, and team composition of an AI orchestrator.
 */
export interface ShinobiConfig {
  /** The role or title of this Shinobi (e.g., "Expert Travel Assistant") */
  role: string;
  /** Brief description of the Shinobi's expertise and approach */
  description: string;
  /** Rich backstory that provides context and personality */
  backstory: string;
  /** Array of Kata configurations that this Shinobi will manage */
  katas: KataConfig[];
  /** Optional shared shurikens available to all katas */
  shurikens?: Shuriken[];
}

/**
 * Result interface for Shinobi execution containing all execution details.
 */
export interface ShinobiExecutionResult {
  /** Results from each individual Kata execution */
  kataResults: ExecutionResult<any>[];
  /** Aggregated billing information across all katas */
  aggregatedBilling: BillingInfo;
  /** Total execution time for the entire Shinobi workflow */
  totalExecutionTime: number;
  /** Unique identifier for this Shinobi instance */
  shinobiId: string;
  /** Final consolidated answer synthesizing all Kata results */
  finalAnswer: string;
}

/**
 * Represents a persona-driven orchestrator that manages multiple specialized agents (Katas).
 * Shinobi provide leadership, personality, and high-level coordination for AI crew workflows.
 * They execute multiple Katas in sequence and synthesize their results into a coherent response.
 * 
 * @example
 * ```typescript
 * const travelExpert = new Shinobi(runtime, {
 *   role: 'Expert Travel Assistant',
 *   description: 'Knowledgeable travel expert with comprehensive planning abilities',
 *   backstory: '15+ years in travel industry, helped thousands plan perfect trips...',
 *   shurikens: [weatherShuriken, calculatorShuriken],
 *   katas: [
 *     {
 *       model: 'gpt-4o-mini',
 *       title: 'Weather Analyst',
 *       description: 'Analyze weather conditions for travel planning'
 *     },
 *     {
 *       model: 'gpt-4o-mini', 
 *       title: 'Cost Calculator',
 *       description: 'Calculate travel costs and budgets'
 *     }
 *   ]
 * });
 * 
 * const result = await travelExpert.execute('Plan a 5-day trip to Paris in December');
 * ```
 */
export class Shinobi {
  private runtime: KataRuntime;
  private logger: Logger;
  private config: ShinobiConfig;
  private katas: Kata[] = [];
  private sharedShurikens: Shuriken[] = [];
  private shinobiId: string;

  /**
   * Creates a new Shinobi instance.
   * 
   * @param runtime The KataRuntime providing dependencies (OpenAI client, logger, memory)
   * @param config Configuration object defining the Shinobi's persona and team
   */
  constructor(runtime: KataRuntime, config: ShinobiConfig) {
    this.runtime = runtime;
    this.shinobiId = randomUUID();
    this.logger = runtime.createTrackedLogger(`Shinobi: ${config.role}`, {
      shinobi_id: this.shinobiId
    });
    this.config = config;

    // Store shared shurikens
    if (config.shurikens) {
      this.sharedShurikens = [...config.shurikens];
    }

    // Initialize katas with Shinobi persona context and shared shurikens
    this.initializeKatas();
  }

  /**
   * Initialize all katas with Shinobi persona context.
   * This ensures each Kata understands its role within the larger crew.
   * 
   * @private
   */
  private initializeKatas(): void {
    const personaContext: ShinobiPersonaContext = {
      role: this.config.role,
      description: this.config.description,
      backstory: this.config.backstory
    };

    this.config.katas.forEach(kataConfig => {
      // Create enhanced kata config with persona context and shared shurikens
      const enhancedKataConfig: KataConfig = {
        ...kataConfig,
        shinobiPersona: personaContext,
        requiresHumanInput: false, // Ensure katas don't ask for user input in crew mode
        shurikens: [
          ...(kataConfig.shurikens || []),
          ...this.sharedShurikens
        ]
      };

      const kata = new Kata(this.runtime, enhancedKataConfig);
      this.katas.push(kata);
      
      this.logger.debug(`Initialized kata: ${kataConfig.title} with Shinobi persona`);
    });
  }

  /**
   * Execute the Shinobi workflow with all configured katas.
   * This is the main orchestration method that coordinates multiple AI agents
   * and synthesizes their results into a comprehensive response.
   * 
   * @param userQuery The user's request or question
   * @returns Promise resolving to an ExecutionResult containing the ShinobiExecutionResult
   * 
   * @example
   * ```typescript
   * const result = await shinobi.execute('Plan a sustainable travel blog business');
   * 
   * console.log(result.result.finalAnswer); // Comprehensive final answer
   * console.log(result.result.kataResults.length); // Number of specialists consulted
   * console.log(result.result.aggregatedBilling.estimatedCost); // Total cost
   * console.log(result.result.totalExecutionTime); // Total time taken
   * ```
   */
  async execute(userQuery: string): Promise<ExecutionResult<ShinobiExecutionResult>> {
    await this.logger.shinobiStart(this.config.role, userQuery, this.shinobiId);
    this.logger.info(`🎯 Executing ${this.katas.length} katas in sequence`);
    
    const shinobiStartTime = Date.now();
    const kataResults: ExecutionResult<any>[] = [];
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalTokens = 0;
    let totalCost = 0;

    try {
      // Execute each kata sequentially
      for (let i = 0; i < this.katas.length; i++) {
        const kata = this.katas[i];
        this.logger.info(`\n🥋 Executing Kata ${i + 1}/${this.katas.length}: ${kata.getConfig().title}`);
        
        const kataResult = await kata.execute(userQuery);
        kataResults.push(kataResult);

        // Aggregate billing information
        if (kataResult.billingInfo) {
          totalPromptTokens += kataResult.billingInfo.tokenUsage.prompt_tokens;
          totalCompletionTokens += kataResult.billingInfo.tokenUsage.completion_tokens;
          totalTokens += kataResult.billingInfo.tokenUsage.total_tokens;
          totalCost += kataResult.billingInfo.estimatedCost;
        }

        this.logger.info(`✅ Kata ${i + 1} completed`);
      }

      const totalExecutionTime = Date.now() - shinobiStartTime;

      // Create aggregated billing info
      const aggregatedBilling: BillingInfo = {
        model: 'shinobi-aggregated',
        tokenUsage: {
          prompt_tokens: totalPromptTokens,
          completion_tokens: totalCompletionTokens,
          total_tokens: totalTokens
        },
        estimatedCost: totalCost,
        timestamp: new Date()
      };

      // Generate final consolidated answer
      const finalAnswer = await this.generateFinalAnswer(userQuery, kataResults);

      const shinobiResult: ShinobiExecutionResult = {
        kataResults,
        aggregatedBilling,
        totalExecutionTime,
        shinobiId: this.shinobiId,
        finalAnswer
      };

      // Log summary
      this.logShinobiSummary(aggregatedBilling, totalExecutionTime);
      await this.logger.shinobiEnd(this.config.role, 'success', totalExecutionTime, totalCost, totalTokens);

      // Display final answer
      this.logger.info('\n🎉 FINAL CONSOLIDATED ANSWER:');
      console.log('\n' + '='.repeat(80));
      console.log(finalAnswer);
      console.log('='.repeat(80));

      return {
        result: shinobiResult,
        billingInfo: aggregatedBilling,
        executionTime: totalExecutionTime
      };

    } catch (error) {
      const totalExecutionTime = Date.now() - shinobiStartTime;
      await this.logger.shinobiEnd(this.config.role, 'failure', totalExecutionTime);
      this.logger.error(`❌ Shinobi "${this.config.role}" execution failed:`, { error: error instanceof Error ? error.message : 'Unknown error' }, error);
      throw error;
    }
  }

  /**
   * Generate a final consolidated answer from all kata results.
   * Uses the Shinobi's persona to synthesize insights from all specialists.
   * 
   * @private
   */
  private async generateFinalAnswer(userQuery: string, kataResults: ExecutionResult<any>[]): Promise<string> {
    this.logger.info('🔄 Generating final consolidated answer...');

    // Prepare context from all kata results
    const kataOutputs = kataResults.map((result, index) => {
      const kataConfig = this.katas[index].getConfig();
      return `${kataConfig.title}: ${typeof result.result === 'string' ? result.result : JSON.stringify(result.result)}`;
    }).join('\n\n');

    const consolidationPrompt = `As ${this.config.role}, you have completed a comprehensive analysis using multiple specialized agents. Here are the results from each agent:

${kataOutputs}

Based on all the above information and your role as ${this.config.role}, provide a final, comprehensive answer to the user's original question: "${userQuery}"

Your response should:
1. Synthesize insights from all agents
2. Provide a clear, actionable answer
3. Maintain your persona as ${this.config.role}
4. Be comprehensive yet concise
5. Address the user's needs completely

Final Answer:`;

    try {
      const response = await this.runtime.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are ${this.config.role}. ${this.config.description}

Background: ${this.config.backstory}

You are consolidating results from multiple specialized AI agents to provide a final, comprehensive answer. Focus on synthesis and providing maximum value to the user.`
          },
          {
            role: 'user',
            content: consolidationPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0]?.message?.content || 'Unable to generate final answer.';
    } catch (error) {
      this.logger.error('Failed to generate final answer:', { error: error instanceof Error ? error.message : 'Unknown error' });
      return `Based on the analysis from ${this.katas.length} specialized agents, here's a summary of the findings:\n\n${kataOutputs}`;
    }
  }

  /**
   * Log Shinobi execution summary.
   * 
   * @private
   */
  private logShinobiSummary(billing: BillingInfo, executionTime: number): void {
    this.logger.info(`\n📊 Shinobi Execution Summary:`);
    this.logger.info(`   Role: ${this.config.role}`);
    this.logger.info(`   Katas Executed: ${this.katas.length}`);
    this.logger.info(`   Total Tokens: ${billing.tokenUsage.total_tokens} (${billing.tokenUsage.prompt_tokens} prompt + ${billing.tokenUsage.completion_tokens} completion)`);
    this.logger.info(`   Total Cost: ${formatCost(billing.estimatedCost)}`);
    this.logger.info(`   Total Execution Time: ${executionTime}ms`);
  }

  /**
   * Add a shuriken to be shared across all katas.
   * 
   * @param shuriken The Shuriken instance to add to all katas
   */
  addSharedShuriken(shuriken: Shuriken): void {
    this.sharedShurikens.push(shuriken);
    
    // Add to all existing katas
    this.katas.forEach(kata => {
      kata.addShuriken(shuriken);
    });
    
    this.logger.debug(`Added shared shuriken: ${shuriken.getName()}`);
  }

  /**
   * Get the Shinobi ID.
   * 
   * @returns The unique identifier for this Shinobi instance
   */
  getId(): string {
    return this.shinobiId;
  }

  /**
   * Get the Shinobi configuration.
   * 
   * @returns A copy of the Shinobi's configuration
   */
  getConfig(): ShinobiConfig {
    return { ...this.config };
  }

  /**
   * Get all katas managed by this Shinobi.
   * 
   * @returns Array of Kata instances
   */
  getKatas(): Kata[] {
    return [...this.katas];
  }

  /**
   * Get the number of katas.
   * 
   * @returns Count of managed katas
   */
  getKataCount(): number {
    return this.katas.length;
  }

  /**
   * Get shared shurikens.
   * 
   * @returns Array of shared Shuriken instances
   */
  getSharedShurikens(): Shuriken[] {
    return [...this.sharedShurikens];
  }

  /**
   * Get the persona context.
   * 
   * @returns The Shinobi's persona information
   */
  getPersonaContext(): ShinobiPersonaContext {
    return {
      role: this.config.role,
      description: this.config.description,
      backstory: this.config.backstory
    };
  }
}