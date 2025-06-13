import OpenAI from 'openai';
import { z } from 'zod';
import { Scroll } from '../core/Scroll';
import type {
  ScrollConfig,
  ScrollResponse,
  ScrollStreamResponse,
  GenerateTextOptions,
  GenerateObjectOptions,
  StreamTextOptions,
  StreamObjectOptions
} from '../types';
import type { TokenUsage } from '../../core/types';
import { createBillingInfo } from '../../utils/billingCalculator';

/**
 * OpenAI implementation of the Scroll interface.
 * Provides access to OpenAI's GPT models through the unified Scroll API.
 */
export class OpenAIScroll extends Scroll {
  private client: OpenAI;

  constructor(config: ScrollConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
  }

  /**
   * Generate text using OpenAI
   */
  async generateText(options: GenerateTextOptions): Promise<ScrollResponse<string>> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
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
      max_tokens: options.maxTokens || 2000,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop: options.stop,
      tools: options.tools,
      tool_choice: options.toolChoice,
      ...this.config.defaultParameters
    });

    const content = response.choices[0]?.message?.content || '';
    const tokenUsage = this.extractTokenUsage(response);
    const billingInfo = tokenUsage ? createBillingInfo(this.config.model, tokenUsage) : undefined;

    return {
      content,
      tokenUsage,
      billingInfo,
      metadata: {
        model: this.config.model,
        finishReason: response.choices[0]?.finish_reason
      }
    };
  }

  /**
   * Generate structured object using OpenAI
   */
  async generateObject<T>(options: GenerateObjectOptions): Promise<ScrollResponse<T>> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide responses in the exact JSON format requested.'
        },
        {
          role: 'user',
          content: `${options.prompt}\n\nPlease respond with valid JSON that matches the required schema.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop: options.stop,
      tools: options.tools,
      tool_choice: options.toolChoice,
      ...this.config.defaultParameters
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
    try {
      parsedResult = options.schema.parse(parsedResult);
    } catch (error) {
      throw new Error(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const tokenUsage = this.extractTokenUsage(response);
    const billingInfo = tokenUsage ? createBillingInfo(this.config.model, tokenUsage) : undefined;

    return {
      content: parsedResult,
      tokenUsage,
      billingInfo,
      metadata: {
        model: this.config.model,
        finishReason: response.choices[0]?.finish_reason
      }
    };
  }

  /**
   * Stream text using OpenAI
   */
  async streamText(options: StreamTextOptions): Promise<ScrollStreamResponse<string>> {
    const stream = await this.client.chat.completions.create({
      model: this.config.model,
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
      stream: true,
      stream_options: { include_usage: true },
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop: options.stop,
      tools: options.tools,
      tool_choice: options.toolChoice,
      ...this.config.defaultParameters
    });

    let fullContent = '';
    let tokenUsage: TokenUsage | undefined;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        if (options.onChunk) {
          options.onChunk(content);
        }
      }

      // Extract usage from the final chunk
      if (chunk.usage) {
        tokenUsage = {
          prompt_tokens: chunk.usage.prompt_tokens,
          completion_tokens: chunk.usage.completion_tokens,
          total_tokens: chunk.usage.total_tokens,
          prompt_tokens_details: chunk.usage.prompt_tokens_details,
          completion_tokens_details: chunk.usage.completion_tokens_details
        };
      }
    }

    const billingInfo = tokenUsage ? createBillingInfo(this.config.model, tokenUsage) : undefined;

    return {
      content: fullContent,
      tokenUsage,
      billingInfo,
      metadata: {
        model: this.config.model,
        streamed: true
      }
    };
  }

  /**
   * Stream structured object using OpenAI
   */
  async streamObject<T>(options: StreamObjectOptions): Promise<ScrollStreamResponse<T>> {
    // Note: OpenAI doesn't support streaming with json_schema, so we use json_object mode
    const stream = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant. Provide responses in valid JSON format that matches the required schema.`
        },
        {
          role: 'user',
          content: `${options.prompt}\n\nPlease respond with valid JSON only that matches the required schema.`
        }
      ],
      response_format: { type: 'json_object' },
      stream: true,
      stream_options: { include_usage: true },
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      stop: options.stop,
      tools: options.tools,
      tool_choice: options.toolChoice,
      ...this.config.defaultParameters
    });

    let fullContent = '';
    let tokenUsage: TokenUsage | undefined;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        if (options.onChunk) {
          options.onChunk(content);
        }
      }

      // Extract usage from the final chunk
      if (chunk.usage) {
        tokenUsage = {
          prompt_tokens: chunk.usage.prompt_tokens,
          completion_tokens: chunk.usage.completion_tokens,
          total_tokens: chunk.usage.total_tokens,
          prompt_tokens_details: chunk.usage.prompt_tokens_details,
          completion_tokens_details: chunk.usage.completion_tokens_details
        };
      }
    }

    try {
      const parsed = JSON.parse(fullContent);
      // Validate against schema
      const result = options.schema.parse(parsed);
      
      const billingInfo = tokenUsage ? createBillingInfo(this.config.model, tokenUsage) : undefined;

      return {
        content: result as T,
        tokenUsage,
        billingInfo,
        metadata: {
          model: this.config.model,
          streamed: true
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse or validate streamed JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'OpenAI';
  }

  /**
   * Test connection to OpenAI
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
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