import { Shinobi, Memory, Logger } from '../../src';
import { KataRuntime } from '../../src/core/kataRuntime';
import { digitalConsultantShinobi } from '../definitions/shinobi/index.js';
import { webSearchShuriken, fileManagerShuriken, calculatorShuriken } from '../definitions/shurikens/index.js';
import OpenAI from 'openai';

export class DigitalConsultingOrchestra {
  private runtime: KataRuntime;
  private logger: Logger;
  private memory?: Memory;

  constructor(openai: OpenAI, logger: Logger, memory?: Memory) {
    this.runtime = new KataRuntime(openai, logger, memory);
    this.logger = logger;
    this.memory = memory;
  }

  async execute(userQuery: string): Promise<void> {
    this.logger.info('💼 Digital Consulting Orchestra - Starting Execution');
    this.logger.info(`📝 Consulting Request: "${userQuery}"`);

    try {
      // Create the digital consultant shinobi with business-focused shurikens
      const digitalConsultant = new Shinobi(this.runtime, {
        ...digitalConsultantShinobi,
        shurikens: [webSearchShuriken, fileManagerShuriken, calculatorShuriken]
      });

      // Execute the shinobi workflow
      const result = await digitalConsultant.execute(userQuery);

      // Log orchestra summary
      this.logger.info('\n💼 DIGITAL CONSULTING ORCHESTRA SUMMARY:');
      this.logger.info(`   Consultant: ${digitalConsultant.getConfig().role}`);
      this.logger.info(`   Analysis Phases: ${result.result.kataResults.length}`);
      this.logger.info(`   Total Cost: $${result.result.aggregatedBilling.estimatedCost.toFixed(6)}`);
      this.logger.info(`   Total Tokens: ${result.result.aggregatedBilling.tokenUsage.total_tokens}`);
      this.logger.info(`   Consulting Time: ${result.result.totalExecutionTime}ms`);

      // Log to memory if available
      if (this.memory) {
        await this.memory.log({
          level: 'info',
          message: 'Digital Consulting Orchestra completed successfully',
          context: 'digital_consulting_orchestra',
          shinobi_id: result.result.shinobiId,
          execution_time: result.result.totalExecutionTime,
          estimated_cost: result.result.aggregatedBilling.estimatedCost,
          token_usage: result.result.aggregatedBilling.tokenUsage,
          metadata: {
            orchestra_type: 'digital_consulting',
            consulting_request: userQuery,
            analysis_phases: result.result.kataResults.length,
            final_recommendation_length: result.result.finalAnswer.length
          }
        });
      }

    } catch (error) {
      this.logger.error('❌ Digital Consulting Orchestra failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (this.memory) {
        await this.memory.log({
          level: 'error',
          message: 'Digital Consulting Orchestra failed',
          context: 'digital_consulting_orchestra',
          metadata: {
            orchestra_type: 'digital_consulting',
            consulting_request: userQuery,
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
      name: 'Digital Consulting Orchestra',
      description: 'Strategic digital consulting with research, technical documentation, and content creation',
      capabilities: [
        'Digital strategy analysis',
        'Technical documentation and specifications',
        'Content creation for digital marketing',
        'Market research and competitive analysis',
        'ROI calculations and business metrics'
      ]
    };
  }
}