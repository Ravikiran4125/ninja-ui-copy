import { KataConfig } from "../../../src/core/kata";

export const costCalculatorKata: KataConfig = {
  model: 'gpt-4o-mini',
  title: 'Travel Cost Calculator',
  description: 'Calculate travel costs, budgets, and provide detailed financial advice for trips. Provide comprehensive cost breakdowns, budget recommendations, and money-saving tips.',
  requiresHumanInput: false,
  parameters: {
    temperature: 0.5,
    max_tokens: 800
  }
};