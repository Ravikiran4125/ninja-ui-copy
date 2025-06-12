import { KataConfig } from "../../../src/core/kata";

export const contentCreatorKata: KataConfig = {
  model: 'gpt-4o-mini',
  title: 'Content Creator',
  description: 'Create engaging, high-quality content for various purposes including articles, reports, presentations, and marketing materials. Focus on clarity, engagement, and audience-appropriate messaging.',
  requiresHumanInput: false,
  parameters: {
    temperature: 0.8,
    max_tokens: 1500
  }
};