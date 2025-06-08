import { KataConfig } from '../../core/kata.js';

export const researchAnalystKata: KataConfig = {
  model: 'gpt-4o-mini',
  title: 'Research Analyst',
  description: 'Conduct comprehensive research and analysis on any topic. Gather information, analyze data, identify trends, and provide detailed insights with evidence-based conclusions.',
  requiresHumanInput: false,
  parameters: {
    temperature: 0.6,
    max_tokens: 1500
  }
};