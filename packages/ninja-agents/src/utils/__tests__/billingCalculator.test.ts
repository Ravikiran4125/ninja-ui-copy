import { TestRunner } from '../testRunner';
import { calculateCost, createBillingInfo, formatCost, getSupportedModels } from '../billingCalculator';
import type { TokenUsage } from '../../core/types';

export async function runBillingCalculatorTests(): Promise<void> {
  const testRunner = new TestRunner();

  await testRunner.runTest('calculateCost - gpt-4o-mini', () => {
    const tokenUsage: TokenUsage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500
    };
    const cost = calculateCost('gpt-4o-mini', tokenUsage);
    const expectedCost = (1000 / 1_000_000) * 0.15 + (500 / 1_000_000) * 0.60;
    
    if (Math.abs(cost - expectedCost) > 0.000001) {
      throw new Error(`Expected ${expectedCost}, got ${cost}`);
    }
  });

  await testRunner.runTest('calculateCost - unknown model defaults to gpt-4o-mini', () => {
    const tokenUsage: TokenUsage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500
    };
    const cost = calculateCost('unknown-model', tokenUsage);
    const expectedCost = (1000 / 1_000_000) * 0.15 + (500 / 1_000_000) * 0.60;
    
    if (Math.abs(cost - expectedCost) > 0.000001) {
      throw new Error(`Expected ${expectedCost}, got ${cost}`);
    }
  });

  await testRunner.runTest('createBillingInfo', () => {
    const tokenUsage: TokenUsage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500
    };
    const billingInfo = createBillingInfo('gpt-4o-mini', tokenUsage);
    
    if (billingInfo.model !== 'gpt-4o-mini') {
      throw new Error(`Expected model 'gpt-4o-mini', got '${billingInfo.model}'`);
    }
    if (billingInfo.tokenUsage !== tokenUsage) {
      throw new Error('Token usage should be the same reference');
    }
    if (billingInfo.estimatedCost <= 0) {
      throw new Error('Estimated cost should be positive');
    }
  });

  await testRunner.runTest('formatCost', () => {
    const formatted = formatCost(0.001234);
    if (formatted !== '$0.001234') {
      throw new Error(`Expected '$0.001234', got '${formatted}'`);
    }
  });

  await testRunner.runTest('getSupportedModels', () => {
    const models = getSupportedModels();
    if (!Array.isArray(models) || models.length === 0) {
      throw new Error('Should return non-empty array of models');
    }
    if (!models.includes('gpt-4o-mini')) {
      throw new Error('Should include gpt-4o-mini');
    }
  });

  testRunner.printSummary();
  
  if (testRunner.hasFailures()) {
    throw new Error('Billing calculator tests failed');
  }
}