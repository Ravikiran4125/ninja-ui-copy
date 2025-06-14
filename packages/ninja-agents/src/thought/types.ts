import { z } from 'zod';
import type { TokenUsage, BillingInfo } from '../core/types.js';

/**
 * Core configuration for a ThoughtModule
 */
export interface ThoughtModuleConfig {
  name: string;
  description?: string;
  template: PromptTemplateConfig;
  strategies?: PromptStrategyConfig[];
  schema?: z.ZodSchema;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Template configuration for dynamic prompt generation
 */
export interface PromptTemplateConfig {
  template: string;
  variables?: Record<string, any>;
  partials?: Record<string, string>;
}

/**
 * Strategy configuration for advanced reasoning
 */
export interface PromptStrategyConfig {
  type: 'chain-of-thought' | 'reflection' | 'multi-perspective' | 'retry' | 'validation';
  config?: Record<string, any>;
}

/**
 * Context passed between thought modules
 */
export interface ThoughtContext {
  input: any;
  memory: Record<string, any>;
  trace: ExecutionTrace[];
  metadata?: Record<string, any>;
}

/**
 * Result from a thought module execution
 */
export interface ThoughtResult<T = any> {
  output: T;
  reasoning?: string;
  confidence?: number;
  tokenUsage?: TokenUsage;
  billingInfo?: BillingInfo;
  executionTime: number;
  trace: ExecutionTrace;
}

/**
 * Execution trace for debugging and analysis
 */
export interface ExecutionTrace {
  id: string;
  moduleId: string;
  timestamp: Date;
  input: any;
  output: any;
  reasoning?: string;
  strategy?: string;
  executionTime: number;
  tokenUsage?: TokenUsage;
  error?: string;
}

/**
 * Graph node for complex reasoning flows
 */
export interface ThoughtNode {
  id: string;
  module: string;
  dependencies: string[];
  condition?: (context: ThoughtContext) => boolean;
}

/**
 * Graph edge for connecting thought modules
 */
export interface ThoughtEdge {
  from: string;
  to: string;
  condition?: (context: ThoughtContext) => boolean;
}