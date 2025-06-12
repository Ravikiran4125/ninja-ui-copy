import { KataConfig } from "../../../src/core/kata";

export const technicalWriterKata: KataConfig = {
  model: 'gpt-4o-mini',
  title: 'Technical Writer',
  description: 'Create clear, comprehensive technical documentation, guides, and specifications. Focus on accuracy, clarity, and practical usability for technical audiences.',
  requiresHumanInput: false,
  parameters: {
    temperature: 0.4,
    max_tokens: 2000
  }
};