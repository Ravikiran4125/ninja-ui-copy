import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import { z } from 'zod';
import { Logger } from '../utils/Logger.js';
import { KataRuntime } from './kataRuntime.js';
import { Shuriken } from './shuriken.js';
import type { OpenAITools, OpenAIParameters, ExecutionResult, BillingInfo, ShinobiPersonaContext } from './types.js';
import { generateText, streamText, generateObject, streamObject } from '../utils/openaiUtils.js';
import { formatCost } from '../utils/billingCalculator.js';

/**
 * Configuration interface for creating a Kata instance.
 * Defines the behavior, capabilities, and personality of an AI agent.
 */
export interface KataConfig {
  /** The OpenAI model to use for this Kata (e.g., 'gpt-4o-mini', 'gpt-4') */
  model: string;
  /** A descriptive title for this Kata that explains its role */
  title: string;
  /** Detailed description of what this Kata specializes in */
  description: string;
  /** Optional array of Shuriken capabilities this Kata can use */
  shurikens?: Shuriken[];
  /** Whether to enable streaming responses (default: false) */
  stream?: boolean;
  /** Optional Zod schema for structured output validation */
  responseSchema?: z.ZodSchema;
  /** OpenAI API parameters (temperature, max_tokens, etc.) */
  parameters?: OpenAIParameters;
  /** Shinobi persona context when this Kata is part of a Shinobi crew */
  shinobiPersona?: ShinobiPersonaContext;
  /** Whether this Kata requires human input during execution (default: false) */
  requiresHumanInput?: boolean;
}

/**
 * Represents a specialized AI agent focused on specific tasks and workflows.
 * Katas are the core execution units that handle conversations, use shurikens,
 * and provide domain-specific expertise within the AI crew system.
 * 
 * @example
 * ```typescript
 * const weatherAnalyst = new Kata(runtime, {
 *   model: 'gpt-4o-mini',
 *   title: 'Weather Analysis Specialist',
 *   description: 'Analyze weather conditions and provide travel recommendations',
 *   shurikens: [weatherShuriken, calculatorShuriken],
 *   parameters: { temperature: 0.7, max_tokens: 1000 }
 * });
 * 
 * const result = await weatherAnalyst.execute('What\'s the weather like in Paris?');
 * ```
 */
export class Kata {
  private runtime: KataRuntime;
  private logger: Logger;
  private config: KataConfig;
  private shurikenDefinitions: OpenAITools = [];
  private shurikenImplementations: Map<string, Shuriken> = new Map();
  private totalBillingInfo: BillingInfo[] = [];
  private kataId: string;

  /**
   * Creates a new Kata instance.
   * 
   * @param runtime The KataRuntime providing dependencies (OpenAI client, logger, memory)
   * @param config Configuration object defining the Kata's behavior and capabilities
   */
  constructor(runtime: KataRuntime, config: KataConfig) {
    this.runtime = runtime;
    this.kataId = randomUUID();
    this.logger = runtime.createTrackedLogger(config.title, {
      kata_id: this.kataId
    });
    this.config = config;

    // Add initial shurikens if provided
    if (config.shurikens) {
      config.shurikens.forEach(shuriken => {
        this.addShuriken(shuriken);
      });
    }
  }

  /**
   * Add a shuriken capability to this kata.
   * The shuriken will be available for the AI to use during conversations.
   * 
   * @param shuriken The Shuriken instance to add
   * 
   * @example
   * ```typescript
   * const kata = new Kata(runtime, config);
   * kata.addShuriken(weatherShuriken);
   * kata.addShuriken(calculatorShuriken);
   * ```
   */
  addShuriken(shuriken: Shuriken): void {
    const shurikenDefinition = shuriken.forge();
    this.shurikenDefinitions.push(shurikenDefinition);
    this.shurikenImplementations.set(shuriken.getName(), shuriken);
    
    this.logger.debug(`Added shuriken: ${shuriken.getName()}`);
  }

  /**
   * Execute the kata with a user query.
   * This is the main entry point for Kata execution, handling the complete
   * conversation flow including shuriken usage and response generation.
   * 
   * @param userQuery The user's request or question
   * @returns Promise resolving to an ExecutionResult with the response and metadata
   * 
   * @example
   * ```typescript
   * const result = await kata.execute('Calculate the weather impact on travel costs for Paris in December');
   * console.log(result.result); // The AI's response
   * console.log(result.executionTime); // Time taken in milliseconds
   * console.log(result.billingInfo?.estimatedCost); // Estimated cost in USD
   * ```
   */
  async execute(userQuery: string): Promise<ExecutionResult<string | any>> {
    await this.logger.kataStart(this.config.title, userQuery, this.kataId);
    const kataStartTime = Date.now();

    try {
      // Determine execution strategy based on configuration
      const hasStream = this.config.stream === true;
      const hasSchema = this.config.responseSchema !== undefined;

      let result: ExecutionResult<string | any>;

      // If we have shurikens, we need to handle the multi-turn conversation first
      if (this.shurikenDefinitions.length > 0) {
        result = await this.executeWithShurikens(userQuery, hasStream, hasSchema);
      } else {
        // Direct execution without shurikens
        result = await this.executeDirect(userQuery, hasStream, hasSchema);
      }

      const totalExecutionTime = Date.now() - kataStartTime;
      
      // Log billing information
      this.logBillingInfo(result);
      
      await this.logger.kataEnd(
        this.config.title, 
        'success', 
        totalExecutionTime,
        result.tokenUsage,
        result.billingInfo?.estimatedCost
      );
      
      return {
        ...result,
        executionTime: totalExecutionTime
      };

    } catch (error) {
      const totalExecutionTime = Date.now() - kataStartTime;
      await this.logger.kataEnd(this.config.title, 'failure', totalExecutionTime);
      this.logger.error('Kata execution failed:', { error: error instanceof Error ? error.message : 'Unknown error' }, error);
      throw error;
    }
  }

  /**
   * Execute kata with shurikens (multi-turn conversation).
   * Handles the complex flow of AI deciding to use tools and processing results.
   * 
   * @private
   */
  private async executeWithShurikens(
    userQuery: string, 
    hasStream: boolean, 
    hasSchema: boolean
  ): Promise<ExecutionResult<string | any>> {
    // Construct system message from title, description, and optional Shinobi persona
    const systemContent = this.buildSystemContent();

    // Step 1: Send initial request with shurikens
    const response = await this.runtime.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: userQuery
        }
      ],
      tools: this.shurikenDefinitions,
      tool_choice: 'auto',
      ...this.config.parameters
    });

    const message = response.choices[0]?.message;
    
    if (!message) {
      throw new Error('No response from OpenAI');
    }

    // Step 2: Check if the AI wants to use shurikens
    if (message.tool_calls && message.tool_calls.length > 0) {
      this.logger.info('🤖 AI decided to use shurikens:');
      
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: userQuery
        },
        message
      ];

      // Step 3: Execute each shuriken call
      for (const shurikenCall of message.tool_calls) {
        await this.logger.shurikenCall(shurikenCall.function.name, shurikenCall.function.arguments);
        
        const shurikenResult = await this.executeShurikenCall(shurikenCall);
        
        // Add shuriken result to conversation
        messages.push({
          role: 'tool',
          tool_call_id: shurikenCall.id,
          content: JSON.stringify(shurikenResult)
        });
      }

      // Step 4: Get final response using appropriate utility function
      return await this.generateFinalResponse(messages, hasStream, hasSchema);
    } else {
      // No shurikens needed, return the direct response
      const content = message.content || '';
      
      // Log the response
      this.logger.info('✅ Direct response generated (no shurikens needed)');
      console.log(content);
      
      // Create execution result
      const tokenUsage = response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
        prompt_tokens_details: response.usage.prompt_tokens_details,
        completion_tokens_details: response.usage.completion_tokens_details
      } : undefined;

      return {
        result: content,
        tokenUsage,
        billingInfo: tokenUsage ? {
          model: this.config.model,
          tokenUsage,
          estimatedCost: this.calculateCost(tokenUsage),
          timestamp: new Date()
        } : undefined,
        executionTime: 0 // Will be set by caller
      };
    }
  }

  /**
   * Execute kata directly without shurikens.
   * Used when the Kata has no capabilities or for simple text generation.
   * 
   * @private
   */
  private async executeDirect(
    userQuery: string, 
    hasStream: boolean, 
    hasSchema: boolean
  ): Promise<ExecutionResult<string | any>> {
    // Construct system message from title, description, and optional Shinobi persona
    const systemContent = this.buildSystemContent();

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemContent
      },
      {
        role: 'user',
        content: userQuery
      }
    ];

    return await this.generateFinalResponse(messages, hasStream, hasSchema);
  }

  /**
   * Build system content with enhanced prompt engineering.
   * Creates the system prompt that defines the Kata's personality and behavior.
   * 
   * @private
   */
  private buildSystemContent(): string {
    let systemContent = '';
    
    // If this Kata is part of a Shinobi, start with the persona context
    if (this.config.shinobiPersona) {
      const { role, description, backstory } = this.config.shinobiPersona;
      systemContent = `PERSONA CONTEXT:
You are operating as: ${role}
Description: ${description}
Backstory: ${backstory}

CREW ORCHESTRATION CONTEXT:
You are part of an AI agent crew system where:
- Shinobi: Persona-driven orchestrators that manage multiple specialized agents (Katas)
- Kata: Specialized AI agents focused on specific tasks and workflows
- Shuriken: Specific capabilities/functions that agents can invoke

Your role in this crew is to execute your specialized task as part of a larger workflow. Work collaboratively with other agents in the crew to achieve the overall objective.

KATA SPECIALIZATION:
${this.config.title}: ${this.config.description}`;
    } else {
      // Standalone Kata
      systemContent = `AI AGENT SYSTEM CONTEXT:
You are an AI agent in a sophisticated crew orchestration system where:
- Kata: Specialized AI agents (like you) focused on specific tasks
- Shuriken: Specific capabilities/functions you can invoke when needed

AGENT SPECIALIZATION:
${this.config.title}: ${this.config.description}`;
    }

    // Add behavioral guidelines
    systemContent += `

CRITICAL BEHAVIORAL GUIDELINES:
1. ALWAYS provide a complete, final answer to the user's request
2. NEVER ask the user for additional input or clarification unless explicitly configured to do so
3. Use available shurikens (functions) when they can help accomplish the task
4. Provide comprehensive, actionable responses based on the information available
5. If you need more information to complete a task, make reasonable assumptions and state them clearly
6. Focus on delivering value and completing the requested task fully
7. Work as part of the crew - your output may be used by other agents in the workflow`;

    // Add interaction mode guidance
    if (this.config.requiresHumanInput === false || this.config.requiresHumanInput === undefined) {
      systemContent += `
8. IMPORTANT: This is an automated workflow. Do NOT ask for user input. Provide complete answers based on available information.`;
    }

    return systemContent;
  }

  /**
   * Generate final response using appropriate utility function.
   * Handles different response modes (streaming, structured, etc.).
   * 
   * @private
   */
  private async generateFinalResponse(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    hasStream: boolean,
    hasSchema: boolean
  ): Promise<ExecutionResult<string | any>> {
    const options = {
      model: this.config.model,
      messages,
      parameters: this.config.parameters
    };

    if (hasSchema && hasStream) {
      // streamObject (with schema validation)
      this.logger.info('📊 Streaming structured response...');
      const result = await streamObject(this.runtime.openai, {
        ...options,
        schema: this.config.responseSchema!,
        onChunk: (chunk) => process.stdout.write(chunk)
      });
      console.log('\n--- END OF STREAM ---');
      this.logger.info('✅ Structured response generated');
      console.log(JSON.stringify(result.result, null, 2));
      return result;
    } else if (hasSchema && !hasStream) {
      // generateObject (structured output)
      this.logger.info('📋 Generating structured response...');
      const result = await generateObject(this.runtime.openai, {
        ...options,
        schema: this.config.responseSchema!
      });
      this.logger.info('✅ Structured response generated');
      console.log(JSON.stringify(result.result, null, 2));
      return result;
    } else if (!hasSchema && hasStream) {
      // streamText (streaming)
      this.logger.info('🌊 Streaming response...');
      const result = await streamText(this.runtime.openai, {
        ...options,
        onChunk: (chunk) => process.stdout.write(chunk)
      });
      console.log('\n--- END OF STREAM ---');
      this.logger.info('✅ Response streamed');
      return result;
    } else {
      // generateText (standard)
      this.logger.info('💬 Generating response...');
      const result = await generateText(this.runtime.openai, options);
      this.logger.info('✅ Response generated');
      console.log(result.result);
      return result;
    }
  }

  /**
   * Execute a shuriken call using the registered implementation.
   * 
   * @private
   */
  private async executeShurikenCall(shurikenCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall) {
    const { name, arguments: args } = shurikenCall.function;
    const parameters = JSON.parse(args);

    const shuriken = this.shurikenImplementations.get(name);
    if (!shuriken) {
      const error = `No shuriken found: ${name}`;
      await this.logger.shurikenError(name, error);
      return { error };
    }

    try {
      // Execute the shuriken
      const result = await shuriken.execute(parameters);
      await this.logger.shurikenResult(name, result.result, result.executionTime);
      return result.result;
    } catch (error) {
      await this.logger.shurikenError(name, error);
      return { error: `Shuriken execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Calculate cost for token usage (simplified version).
   * 
   * @private
   */
  private calculateCost(tokenUsage: any): number {
    // Simplified cost calculation - you can enhance this based on your billing calculator
    const inputCost = (tokenUsage.prompt_tokens / 1_000_000) * 0.15; // gpt-4o-mini input cost
    const outputCost = (tokenUsage.completion_tokens / 1_000_000) * 0.60; // gpt-4o-mini output cost
    return inputCost + outputCost;
  }

  /**
   * Log billing information.
   * 
   * @private
   */
  private logBillingInfo(result: ExecutionResult<any>): void {
    if (result.billingInfo) {
      this.totalBillingInfo.push(result.billingInfo);
      this.logger.info(`💰 Token Usage: ${result.billingInfo.tokenUsage.total_tokens} tokens (${result.billingInfo.tokenUsage.prompt_tokens} prompt + ${result.billingInfo.tokenUsage.completion_tokens} completion)`);
      this.logger.info(`💵 Estimated Cost: ${formatCost(result.billingInfo.estimatedCost)}`);
      this.logger.info(`⏱️ Execution Time: ${result.executionTime}ms`);
    }
  }

  /**
   * Get the Kata ID.
   * 
   * @returns The unique identifier for this Kata instance
   */
  getId(): string {
    return this.kataId;
  }

  /**
   * Get total billing information for this kata.
   * 
   * @returns Array of all billing information from executions
   */
  getTotalBillingInfo(): BillingInfo[] {
    return [...this.totalBillingInfo];
  }

  /**
   * Get total estimated cost for this kata.
   * 
   * @returns Total cost in USD across all executions
   */
  getTotalEstimatedCost(): number {
    return this.totalBillingInfo.reduce((total, billing) => total + billing.estimatedCost, 0);
  }

  /**
   * Get total token usage for this kata.
   * 
   * @returns Aggregated token usage across all executions
   */
  getTotalTokenUsage(): { prompt_tokens: number; completion_tokens: number; total_tokens: number } {
    return this.totalBillingInfo.reduce(
      (total, billing) => ({
        prompt_tokens: total.prompt_tokens + billing.tokenUsage.prompt_tokens,
        completion_tokens: total.completion_tokens + billing.tokenUsage.completion_tokens,
        total_tokens: total.total_tokens + billing.tokenUsage.total_tokens
      }),
      { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    );
  }

  /**
   * Get the kata configuration.
   * 
   * @returns A copy of the Kata's configuration
   */
  getConfig(): KataConfig {
    return { ...this.config };
  }

  /**
   * Get the number of registered shurikens.
   * 
   * @returns Count of available shurikens
   */
  getShurikenCount(): number {
    return this.shurikenDefinitions.length;
  }

  /**
   * Get the names of all registered shurikens.
   * 
   * @returns Array of shuriken names
   */
  getShurikenNames(): string[] {
    return Array.from(this.shurikenImplementations.keys());
  }

  /**
   * Get all registered shurikens.
   * 
   * @returns Array of Shuriken instances
   */
  getShurikens(): Shuriken[] {
    return Array.from(this.shurikenImplementations.values());
  }

  /**
   * Update kata configuration.
   * 
   * @param updates Partial configuration updates to apply
   */
  updateConfig(updates: Partial<KataConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.debug('Kata configuration updated');
  }

  /**
   * Check if kata has streaming enabled.
   * 
   * @returns True if streaming is enabled
   */
  isStreamingEnabled(): boolean {
    return this.config.stream === true;
  }

  /**
   * Check if kata has response schema configured.
   * 
   * @returns True if structured output is configured
   */
  hasResponseSchema(): boolean {
    return this.config.responseSchema !== undefined;
  }

  /**
   * Check if kata requires human input.
   * 
   * @returns True if human input is required during execution
   */
  requiresHumanInput(): boolean {
    return this.config.requiresHumanInput === true;
  }
}