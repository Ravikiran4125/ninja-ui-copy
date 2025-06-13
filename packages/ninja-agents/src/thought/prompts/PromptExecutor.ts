import OpenAI from 'openai';
import { z } from 'zod';
import type { ExecutionResult, TokenUsage, BillingInfo } from '../../core/types.js';
import { createBillingInfo } from '../../utils/billingCalculator.js';

interface ExecuteOptions {
  prompt: string;
  schema?: z.ZodSchema;
  maxRetries?: number;
  timeout?: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Executes prompts via LLM providers with validation and error handling.
 * Handles structured output, retries, and comprehensive result tracking.
 */
export class PromptExecutor {
  private openai: OpenAI;
  private defaultModel: string;

  constructor(openai: OpenAI, defaultModel: string = 'gpt-4o-mini') {
    this.openai = openai;
    this.defaultModel = defaultModel;
  }

  /**
   * Execute a prompt with optional schema validation
   */
  async execute(options: ExecuteOptions): Promise<ExecutionResult<any>> {
    const startTime = Date.now();
    const model = options.model || this.defaultModel;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= (options.maxRetries || 1); attempt++) {
      try {
        const result = options.schema 
          ? await this.executeWithSchema(options, model)
          : await this.executeText(options, model);

        const executionTime = Date.now() - startTime;
        return { ...result, executionTime };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === (options.maxRetries || 1)) {
          throw lastError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error('Execution failed');
  }

  /**
   * Execute prompt with structured output validation
   */
  private async executeWithSchema(options: ExecuteOptions, model: string): Promise<Omit<ExecutionResult<any>, 'executionTime'>> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide responses in the exact format requested.'
        },
        {
          role: 'user',
          content: `${options.prompt}\n\nPlease respond with valid JSON that matches the required schema.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Validate against schema
    if (options.schema) {
      try {
        parsedResult = options.schema.parse(parsedResult);
      } catch (error) {
        throw new Error(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const tokenUsage = this.extractTokenUsage(response);
    const billingInfo = tokenUsage ? createBillingInfo(model, tokenUsage) : undefined;

    return {
      result: parsedResult,
      tokenUsage,
      billingInfo
    };
  }

  /**
   * Execute prompt for text output
   */
  private async executeText(options: ExecuteOptions, model: string): Promise<Omit<ExecutionResult<any>, 'executionTime'>> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.'
        },
        {
          role: 'user',
          content: options.prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received');
    }

    const tokenUsage = this.extractTokenUsage(response);
    const billingInfo = tokenUsage ? createBillingInfo(model, tokenUsage) : undefined;

    return {
      result: content,
      tokenUsage,
      billingInfo
    };
  }

  /**
   * Extract token usage from OpenAI response
   */
  private extractTokenUsage(response: OpenAI.Chat.Completions.ChatCompletion): TokenUsage | undefined {
    if (!response.usage) return undefined;
    
    return {
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
      prompt_tokens_details: response.usage.prompt_tokens_details,
      completion_tokens_details: response.usage.completion_tokens_details
    };
  }
}