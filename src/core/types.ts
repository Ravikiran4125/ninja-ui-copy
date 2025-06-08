import OpenAI from 'openai';

/**
 * OpenAI tool type for function calling.
 * Represents a single function that can be called by the AI.
 */
export type OpenAITool = OpenAI.Chat.Completions.ChatCompletionTool;

/**
 * OpenAI tool function definition.
 * Contains the function name, description, and parameter schema.
 */
export type OpenAIToolFunction = OpenAI.Chat.Completions.ChatCompletionTool['function'];

/**
 * OpenAI tool parameters schema.
 * JSON Schema defining the expected parameters for a function.
 */
export type OpenAIToolParameters = OpenAI.Chat.Completions.ChatCompletionTool['function']['parameters'];

/**
 * Array of OpenAI tools for multiple function definitions.
 */
export type OpenAITools = OpenAITool[];

/**
 * Token usage tracking interface for monitoring API consumption.
 * Provides detailed breakdown of token usage for cost calculation and optimization.
 */
export interface TokenUsage {
  /** Number of tokens used in the prompt/input */
  prompt_tokens: number;
  /** Number of tokens generated in the completion/output */
  completion_tokens: number;
  /** Total tokens used (prompt + completion) */
  total_tokens: number;
  /** Detailed breakdown of prompt token usage */
  prompt_tokens_details?: {
    /** Number of cached tokens (if applicable) */
    cached_tokens?: number;
    /** Number of audio tokens (if applicable) */
    audio_tokens?: number;
  };
  /** Detailed breakdown of completion token usage */
  completion_tokens_details?: {
    /** Number of reasoning tokens (for reasoning models) */
    reasoning_tokens?: number;
    /** Number of audio tokens (if applicable) */
    audio_tokens?: number;
    /** Number of accepted prediction tokens */
    accepted_prediction_tokens?: number;
    /** Number of rejected prediction tokens */
    rejected_prediction_tokens?: number;
  };
}

/**
 * Billing information interface for cost tracking and analysis.
 * Contains all information needed for cost calculation and billing reports.
 */
export interface BillingInfo {
  /** The OpenAI model used for this operation */
  model: string;
  /** Token usage details for this operation */
  tokenUsage: TokenUsage;
  /** Estimated cost in USD for this operation */
  estimatedCost: number;
  /** Timestamp when this billing information was created */
  timestamp: Date;
}

/**
 * Extended OpenAI parameters interface for fine-tuning model behavior.
 * Provides comprehensive control over model generation parameters.
 */
export interface OpenAIParameters {
  /** Controls randomness in output (0.0 to 2.0) */
  temperature?: number;
  /** Controls nucleus sampling (0.0 to 1.0) */
  top_p?: number;
  /** Number of completions to generate */
  n?: number;
  /** Sequences where the API will stop generating */
  stop?: string | string[];
  /** Penalizes new tokens based on their presence in the text so far */
  presence_penalty?: number;
  /** Penalizes new tokens based on their frequency in the text so far */
  frequency_penalty?: number;
  /** Seed for deterministic generation */
  seed?: number;
  /** Maximum number of tokens to generate */
  max_tokens?: number;
  /** Modify the likelihood of specified tokens appearing */
  logit_bias?: Record<string, number>;
  /** User identifier for tracking and abuse monitoring */
  user?: string;
}

/**
 * Execution result with comprehensive tracking and metadata.
 * Returned by all major operations (Shuriken, Kata, Shinobi) for consistent monitoring.
 * 
 * @template T The type of the result data
 */
export interface ExecutionResult<T = any> {
  /** The actual result/output of the operation */
  result: T;
  /** Token usage information (if applicable) */
  tokenUsage?: TokenUsage;
  /** Billing information (if applicable) */
  billingInfo?: BillingInfo;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Shinobi persona context interface for character-driven AI orchestration.
 * Provides rich personality and background information that influences AI behavior.
 */
export interface ShinobiPersonaContext {
  /** The role or title of the Shinobi (e.g., "Expert Travel Assistant") */
  role: string;
  /** Brief description of expertise and approach */
  description: string;
  /** Rich backstory providing context and personality */
  backstory: string;
}