import { DojoConfig } from "ninja-agents";
import { researchDirectorShinobi } from '../shinobi/researchDirectorShinobi';

// Define workflow steps for the Dojo
export const exampleDojoSteps = [
  {
    id: 'initial-research',
    type: 'shinobi' as const,
    config: researchDirectorShinobi
  },
  {
    id: 'analysis-synthesis',
    type: 'shinobi' as const,
    config: {
      role: 'Analysis Synthesizer',
      description: 'Synthesizes research findings into actionable insights',
      backstory: 'Expert in data synthesis and strategic recommendation development with 10+ years of experience.',
      katas: [
        {
          model: 'gpt-4o-mini',
          title: 'Insight Synthesizer',
          description: 'Combine multiple research sources into coherent insights'
        },
        {
          model: 'gpt-4o-mini',
          title: 'Recommendation Generator',
          description: 'Generate actionable recommendations based on analysis'
        }
      ]
    }
  }
];

export const exampleDojo: DojoConfig = {
  name: 'Sequential Research and Analysis Workflow',
  description: 'A structured workflow that conducts research and then synthesizes findings into actionable recommendations',
  steps: exampleDojoSteps,
  errorHandling: 'continue',
  maxRetries: 2
};