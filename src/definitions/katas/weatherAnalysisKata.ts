import { KataConfig } from '../../core/kata.js';

export const weatherAnalysisKata: KataConfig = {
  model: 'gpt-4o-mini',
  title: 'Weather Analysis Specialist',
  description: 'Analyze weather conditions and provide comprehensive travel recommendations based on weather data. Focus on providing detailed weather insights, seasonal considerations, and practical travel advice.',
  requiresHumanInput: false,
  parameters: {
    temperature: 0.7,
    max_tokens: 1000
  }
};