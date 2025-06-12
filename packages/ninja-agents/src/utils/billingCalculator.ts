/**
 * Utility for calculating OpenAI API costs based on token usage
 */

import type { TokenUsage, BillingInfo } from '../core/types.js';

// Pricing per 1M tokens (as of 2024)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-4': { input: 30.00, output: 60.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  'gpt-3.5-turbo-instruct': { input: 1.50, output: 2.00 }
};

/**
 * Calculate estimated cost for token usage
 */
export function calculateCost(model: string, tokenUsage: TokenUsage): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    // Default to gpt-4o-mini pricing for unknown models
    const defaultPricing = MODEL_PRICING['gpt-4o-mini'];
    const inputCost = (tokenUsage.prompt_tokens / 1_000_000) * defaultPricing.input;
    const outputCost = (tokenUsage.completion_tokens / 1_000_000) * defaultPricing.output;
    return inputCost + outputCost;
  }

  const inputCost = (tokenUsage.prompt_tokens / 1_000_000) * pricing.input;
  const outputCost = (tokenUsage.completion_tokens / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}

/**
 * Create billing information from token usage
 */
export function createBillingInfo(model: string, tokenUsage: TokenUsage): BillingInfo {
  return {
    model,
    tokenUsage,
    estimatedCost: calculateCost(model, tokenUsage),
    timestamp: new Date()
  };
}

/**
 * Format cost as currency string
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}

/**
 * Get supported models list
 */
export function getSupportedModels(): string[] {
  return Object.keys(MODEL_PRICING);
}