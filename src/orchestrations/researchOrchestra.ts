import { KataRuntime } from '../core/kataRuntime.js';
import { Shinobi } from '../core/shinobi.js';
import { Logger } from '../utils/Logger.js';
import { Memory } from '../core/memory.js';
import { researchDirectorShinobi } from '../definitions/shinobi/index.js';
import { webSearchShuriken, fileManagerShuriken } from '../definitions/shurikens/index.js';
import OpenAI from 'openai';

export class ResearchOrchestra {
  private runtime: KataRuntime;
  private logger: Logger;
  private memory?: Memory;

  constructor(openai: OpenAI, logger: Logger, memory?: Memory) {
    this.runtime = new KataRuntime(openai, logger, memory);
    this.logger = logger;
    this.memory = memory;
  }

  async execute(userQuery: string): Promise<void> {
    this.logger.info('🔬 Research Orchestra - Starting Execution');
    this.logger.info(`📝 Research Topic: "${userQuery}"`);

    try {
      // Create the research director shinobi with research-focused shurikens
      const researchDirector = new Shinobi(this.runtime, {
        ...researchDirectorShinobi,
        shurikens: [webSearchShuriken, fileManagerShuriken]
      });

      // Execute the shinobi workflow
      const result = await researchDirector.execute(userQuery);

      // Log orchestra summary
      this.logger.info('\n🔬 RESEARCH ORCHESTRA SUMMARY:');
      this.logger.info(`   Research Director: ${researchDirector.getConfig().role}`);
      this.logger.info(`   Research Phases: ${result.result.kataResults.length}`);
      this.logger.info(`   Total Cost: $${result.result.aggregatedBilling.estimatedCost.toFixed(6)}`);
      this.logger.info(`   Total Tokens: ${result.result.aggregatedBilling.tokenUsage.total_tokens}`);
      this.logger.info(`   Research Time: ${result.result.totalExecutionTime}ms`);

      // Log to memory if available
      if (this.memory) {
        await this.memory.log({
          level: 'info',
          message: 'Research Orchestra completed successfully',
          context: 'research_orchestra',
          shinobi_id: result.result.shinobiId,
          execution_time: result.result.totalExecutionTime,
          estimated_cost: result.result.aggregatedBilling.estimatedCost,
          token_usage: result.result.aggregatedBilling.tokenUsage,
          metadata: {
            orchestra_type: 'research',
            research_topic: userQuery,
            research_phases: result.result.kataResults.length,
            final_report_length: result.result.finalAnswer.length
          }
        });
      }

    } catch (error) {
      this.logger.error('❌ Research Orchestra failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (this.memory) {
        await this.memory.log({
          level: 'error',
          message: 'Research Orchestra failed',
          context: 'research_orchestra',
          metadata: {
            orchestra_type: 'research',
            research_topic: userQuery,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
      
      throw error;
    }
  }

  /**
   * Get orchestra information
   */
  getInfo(): { name: string; description: string; capabilities: string[] } {
    return {
      name: 'Research Orchestra',
      description: 'Comprehensive research and analysis with content creation and technical documentation',
      capabilities: [
        'In-depth research and analysis',
        'Content creation and writing',
        'Technical documentation',
        'Web search and information gathering',
        'File management and organization'
      ]
    };
  }
}