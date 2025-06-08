import { KataRuntime } from '../core/kataRuntime.js';
import { Shinobi } from '../core/shinobi.js';
import { Logger } from '../utils/Logger.js';
import { Memory } from '../core/memory.js';
import { travelExpertShinobi } from '../definitions/shinobi/index.js';
import { weatherShuriken, calculatorShuriken, webSearchShuriken } from '../definitions/shurikens/index.js';
import OpenAI from 'openai';

export class TravelPlanningOrchestra {
  private runtime: KataRuntime;
  private logger: Logger;
  private memory?: Memory;

  constructor(openai: OpenAI, logger: Logger, memory?: Memory) {
    this.runtime = new KataRuntime(openai, logger, memory);
    this.logger = logger;
    this.memory = memory;
  }

  async execute(userQuery: string): Promise<void> {
    this.logger.info('🎼 Travel Planning Orchestra - Starting Execution');
    this.logger.info(`📝 User Query: "${userQuery}"`);

    try {
      // Create the travel expert shinobi with shared shurikens
      const travelExpert = new Shinobi(this.runtime, {
        ...travelExpertShinobi,
        shurikens: [weatherShuriken, calculatorShuriken, webSearchShuriken]
      });

      // Execute the shinobi workflow
      const result = await travelExpert.execute(userQuery);

      // Log orchestra summary
      this.logger.info('\n🎼 TRAVEL PLANNING ORCHESTRA SUMMARY:');
      this.logger.info(`   Shinobi: ${travelExpert.getConfig().role}`);
      this.logger.info(`   Katas Executed: ${result.result.kataResults.length}`);
      this.logger.info(`   Total Cost: $${result.result.aggregatedBilling.estimatedCost.toFixed(6)}`);
      this.logger.info(`   Total Tokens: ${result.result.aggregatedBilling.tokenUsage.total_tokens}`);
      this.logger.info(`   Execution Time: ${result.result.totalExecutionTime}ms`);

      // Log to memory if available
      if (this.memory) {
        await this.memory.log({
          level: 'info',
          message: 'Travel Planning Orchestra completed successfully',
          context: 'travel_orchestra',
          shinobi_id: result.result.shinobiId,
          execution_time: result.result.totalExecutionTime,
          estimated_cost: result.result.aggregatedBilling.estimatedCost,
          token_usage: result.result.aggregatedBilling.tokenUsage,
          metadata: {
            orchestra_type: 'travel_planning',
            user_query: userQuery,
            katas_count: result.result.kataResults.length,
            final_answer_length: result.result.finalAnswer.length
          }
        });
      }

    } catch (error) {
      this.logger.error('❌ Travel Planning Orchestra failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (this.memory) {
        await this.memory.log({
          level: 'error',
          message: 'Travel Planning Orchestra failed',
          context: 'travel_orchestra',
          metadata: {
            orchestra_type: 'travel_planning',
            user_query: userQuery,
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
      name: 'Travel Planning Orchestra',
      description: 'Comprehensive travel planning assistance with weather analysis, cost calculation, and destination recommendations',
      capabilities: [
        'Weather analysis and forecasting',
        'Travel cost calculation and budgeting',
        'Destination recommendations',
        'Web search for travel information',
        'Mathematical calculations for trip planning'
      ]
    };
  }
}