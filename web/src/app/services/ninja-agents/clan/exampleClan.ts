import { ClanConfig } from "ninja-agents";
import { researchDirectorShinobi } from '../shinobi/researchDirectorShinobi';

// Create additional Shinobi configurations for the clan
const technicalAnalystShinobi = {
  role: 'Technical Analyst',
  description: 'Expert in technical analysis and system architecture',
  backstory: 'Senior technical architect with 15+ years of experience in system design, performance optimization, and technology evaluation.',
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Technical Evaluator',
      description: 'Evaluate technical feasibility and architecture decisions'
    },
    {
      model: 'gpt-4o-mini',
      title: 'Performance Analyst',
      description: 'Analyze performance implications and optimization strategies'
    }
  ]
};

const businessAnalystShinobi = {
  role: 'Business Analyst',
  description: 'Strategic business analysis and market research expert',
  backstory: 'MBA with 12+ years in business strategy, market analysis, and competitive intelligence across multiple industries.',
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Market Researcher',
      description: 'Conduct market analysis and competitive research'
    },
    {
      model: 'gpt-4o-mini',
      title: 'Business Strategist',
      description: 'Develop business strategies and recommendations'
    }
  ]
};

export const exampleClan: ClanConfig = {
  name: 'Multi-Perspective Analysis Team',
  description: 'A collaborative team of experts providing comprehensive analysis from research, technical, and business perspectives',
  strategy: 'collaborative',
  shinobi: [
    researchDirectorShinobi,
    technicalAnalystShinobi,
    businessAnalystShinobi
  ],
  maxConcurrency: 3,
  timeout: 300000 // 5 minutes
};