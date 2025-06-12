import { KataConfig } from "../../../src/core/kata";

export const destinationRecommenderKata: KataConfig = {
  model: 'gpt-4o-mini',
  title: 'Destination Recommender',
  description: 'Provide destination recommendations and comprehensive travel tips based on user preferences. Offer detailed travel advice, local insights, cultural information, and practical recommendations.',
  requiresHumanInput: false,
  parameters: {
    temperature: 0.8,
    max_tokens: 1200
  }
};