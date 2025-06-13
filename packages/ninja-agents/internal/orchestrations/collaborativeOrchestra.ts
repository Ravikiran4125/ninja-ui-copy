import { Shinobi, Memory, Logger } from '../../src';
import { KataRuntime } from '../../src/core/kataRuntime';
import { travelExpertShinobi, researchDirectorShinobi, digitalConsultantShinobi } from '../definitions/shinobi/index';
import { weatherShuriken, calculatorShuriken, webSearchShuriken, fileManagerShuriken } from '../definitions/shurikens/index';
import OpenAI from 'openai';

export class CollaborativeOrchestra {
  private runtime: KataRuntime;
  private logger: Logger;
  private memory?: Memory;

  constructor(openai: OpenAI, logger: Logger, memory?: Memory) {
    this.runtime = new KataRuntime(openai, logger, memory);
    this.logger = logger;
    this.memory = memory;
  }

  async execute(userQuery: string): Promise<void> {
    this.logger.info('🤝 Collaborative Orchestra - Starting Multi-Shinobi Execution');
    this.logger.info(`📝 Complex Request: "${userQuery}"`);

    try {
      const allShurikens = [weatherShuriken, calculatorShuriken, webSearchShuriken, fileManagerShuriken];
      
      // Create multiple shinobi for collaborative work
      const travelExpert = new Shinobi(this.runtime, {
        ...travelExpertShinobi,
        shurikens: allShurikens
      });

      const researchDirector = new Shinobi(this.runtime, {
        ...researchDirectorShinobi,
        shurikens: allShurikens
      });

      const digitalConsultant = new Shinobi(this.runtime, {
        ...digitalConsultantShinobi,
        shurikens: allShurikens
      });

      // Execute shinobi in sequence for collaborative analysis
      this.logger.info('\n🎯 Phase 1: Travel Expert Analysis');
      const travelResult = await travelExpert.execute(userQuery);

      this.logger.info('\n🔬 Phase 2: Research Director Analysis');
      const researchQuery = `Building on the travel analysis, provide additional research insights for: ${userQuery}`;
      const researchResult = await researchDirector.execute(researchQuery);

      this.logger.info('\n💼 Phase 3: Digital Consultant Strategic Review');
      const consultingQuery = `Considering both travel and research perspectives, provide strategic digital consulting insights for: ${userQuery}`;
      const consultingResult = await digitalConsultant.execute(consultingQuery);

      // Generate collaborative final answer
      const collaborativeFinalAnswer = await this.generateCollaborativeFinalAnswer(
        userQuery,
        [
          { role: 'Travel Expert', result: travelResult.result.finalAnswer },
          { role: 'Research Director', result: researchResult.result.finalAnswer },
          { role: 'Digital Consultant', result: consultingResult.result.finalAnswer }
        ]
      );

      // Calculate total metrics
      const totalCost = travelResult.result.aggregatedBilling.estimatedCost + 
                       researchResult.result.aggregatedBilling.estimatedCost + 
                       consultingResult.result.aggregatedBilling.estimatedCost;
      
      const totalTokens = travelResult.result.aggregatedBilling.tokenUsage.total_tokens + 
                         researchResult.result.aggregatedBilling.tokenUsage.total_tokens + 
                         consultingResult.result.aggregatedBilling.tokenUsage.total_tokens;
      
      const totalTime = travelResult.result.totalExecutionTime + 
                       researchResult.result.totalExecutionTime + 
                       consultingResult.result.totalExecutionTime;

      // Display collaborative final answer
      this.logger.info('\n🤝 COLLABORATIVE FINAL SYNTHESIS:');
      console.log('\n' + '='.repeat(100));
      console.log(collaborativeFinalAnswer);
      console.log('='.repeat(100));

      // Log orchestra summary
      this.logger.info('\n🤝 COLLABORATIVE ORCHESTRA SUMMARY:');
      this.logger.info(`   Shinobi Participants: 3 (Travel Expert, Research Director, Digital Consultant)`);
      this.logger.info(`   Total Katas Executed: ${travelResult.result.kataResults.length + researchResult.result.kataResults.length + consultingResult.result.kataResults.length}`);
      this.logger.info(`   Total Cost: $${totalCost.toFixed(6)}`);
      this.logger.info(`   Total Tokens: ${totalTokens}`);
      this.logger.info(`   Total Execution Time: ${totalTime}ms`);

      // Log to memory if available
      if (this.memory) {
        await this.memory.log({
          level: 'info',
          message: 'Collaborative Orchestra completed successfully',
          context: 'collaborative_orchestra',
          execution_time: totalTime,
          estimated_cost: total

,
          metadata: {
            orchestra_type: 'collaborative',
            user_query: userQuery,
            shinobi_count: 3,
            total_katas: travelResult.result.kataResults.length + researchResult.result.kataResults.length + consultingResult.result.kataResults.length,
            total_tokens: totalTokens,
            final_synthesis_length: collaborativeFinalAnswer.length,
            participants: ['Travel Expert', 'Research Director', 'Digital Consultant']
          }
        });
      }

    } catch (error) {
      this.logger.error('❌ Collaborative Orchestra failed:', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (this.memory) {
        await this.memory.log({
          level: 'error',
          message: 'Collaborative Orchestra failed',
          context: 'collaborative_orchestra',
          metadata: {
            orchestra_type: 'collaborative',
            user_query: userQuery,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
      
      throw error;
    }
  }

  /**
   * Generate a collaborative final answer from multiple shinobi perspectives
   */
  private async generateCollaborativeFinalAnswer(
    userQuery: string, 
    shinobiResults: Array<{ role: string; result: string }>
  ): Promise<string> {
    this.logger.info('🔄 Generating collaborative synthesis...');

    const perspectivesText = shinobiResults.map(({ role, result }) => 
      `${role} Perspective:\n${result}`
    ).join('\n\n' + '-'.repeat(80) + '\n\n');

    const synthesisPrompt = `You are a Master Orchestrator overseeing a collaborative AI crew system. You have received comprehensive analyses from multiple expert perspectives on the following request:

"${userQuery}"

Here are the detailed analyses from each expert:

${perspectivesText}

Your task is to synthesize these diverse expert perspectives into a single, comprehensive, and actionable final answer that:

1. Integrates insights from all three expert perspectives
2. Identifies synergies and complementary recommendations
3. Resolves any conflicting viewpoints with balanced reasoning
4. Provides a clear, actionable roadmap for the user
5. Highlights the unique value each perspective brings
6. Delivers maximum practical value to address the user's original request

Create a masterful synthesis that demonstrates the power of collaborative AI expertise.

COLLABORATIVE SYNTHESIS:`;

    try {
      const response = await this.runtime.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a Master Orchestrator with expertise in synthesizing diverse expert perspectives into cohesive, actionable guidance. You excel at identifying synergies, resolving conflicts, and creating comprehensive solutions that leverage the best of all expert inputs.`
          },
          {
            role: 'user',
            content: synthesisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return response.choices[0]?.message?.content || 'Unable to generate collaborative synthesis.';
    } catch (error) {
      this.logger.error('Failed to generate collaborative synthesis:', { error: error instanceof Error ? error.message : 'Unknown error' });
      return `COLLABORATIVE SYNTHESIS:\n\nBased on the comprehensive analysis from our expert team:\n\n${perspectivesText}`;
    }
  }

  /**
   * Get orchestra information
   */
  getInfo(): { name: string; description: string; capabilities: string[] } {
    return {
      name: 'Collaborative Orchestra',
      description: 'Multi-expert collaborative analysis combining travel, research, and digital consulting expertise',
      capabilities: [
        'Multi-perspective expert analysis',
        'Collaborative synthesis and integration',
        'Travel planning and logistics',
        'Comprehensive research and analysis',
        'Digital strategy and consulting',
        'Cross-domain problem solving',
        'Synergistic recommendation generation'
      ]
    };
  }
}