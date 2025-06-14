import { z } from 'zod';
import type { TokenUsage, BillingInfo } from '../core/types.js';

/**
 * Configuration for Scroll providers
 */
export interface ScrollConfig {
  model: string;
  apiKey?: string;
  baseURL?: string;
  defaultParameters?: Record<string, any>;
}

/**
 * Standard response from Scroll providers
 */
export interface ScrollResponse<T = string> {
  content: T;
  tokenUsage?: TokenUsage;
  billingInfo?: BillingInfo;
  metadata?: Record<string, any>;
}

/**
 * Streaming response from Scroll providers
 */
export interface ScrollStreamResponse<T = string> {
  content: T;
  tokenUsage?: TokenUsage;
  billingInfo?: BillingInfo;
  metadata?: Record<string, any>;
}

/**
 * Options for text generation
 */
export interface GenerateTextOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  tools?: any[];
  toolChoice?: 'auto' | 'none' | any;
}

/**
 * Options for object generation
 */
export interface GenerateObjectOptions extends GenerateTextOptions {
  schema: z.ZodSchema;
}

/**
 * Options for text streaming
 */
export interface StreamTextOptions extends GenerateTextOptions {
  onChunk?: (chunk: string) => void;
}

/**
 * Options for object streaming
 */
export interface StreamObjectOptions extends GenerateObjectOptions {
  onChunk?: (chunk: string) => void;
}