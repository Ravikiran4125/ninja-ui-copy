import dotenv from 'dotenv';
import OpenAI from 'openai';
import { Logger } from './utils/Logger.js';
import { Memory } from './core/memory.js';
import { TravelPlanningOrchestra, ResearchOrchestra, DigitalConsultingOrchestra } from './orchestrations/index.js';
import { CollaborativeOrchestra } from './orchestrations/collaborativeOrchestra.js';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

async function main() {
  console.log(chalk.bold.blue('🎼 AI Crew Orchestration System Demo'));
  console.log('='.repeat(80));

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.log('Please set your OpenAI API key in the .env file');
    process.exit(1);
  }

  // Initialize core services
  const openai = new OpenAI({ apiKey });
  const memory = new Memory({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    enableDatabaseLogging: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
    enableFileLogging: false,
    defaultFilePath: './logs/orchestration.jsonl'
  });
  const logger = new Logger('info', 'OrchestrationDemo', memory);

  try {
    // Log demo start
    await memory.log({
      level: 'info',
      message: '🎼 AI Crew Orchestration Demo Started',
      context: 'orchestration_demo',
      metadata: {
        event_type: 'demo_start',
        supabase_enabled: memory.isDatabaseLoggingEnabled()
      }
    });

    // Demo 1: Travel Planning Orchestra
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.yellow('DEMO 1: TRAVEL PLANNING ORCHESTRA'));
    console.log('='.repeat(80));
    
    const travelOrchestra = new TravelPlanningOrchestra(openai, logger, memory);
    console.log(chalk.cyan(`Orchestra: ${travelOrchestra.getInfo().name}`));
    console.log(chalk.gray(`Description: ${travelOrchestra.getInfo().description}`));
    
    await travelOrchestra.execute('I want to plan a 7-day trip to Japan in March for 2 people. What\'s the weather like, estimated costs, and best destinations to visit?');

    // Demo 2: Research Orchestra
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.green('DEMO 2: RESEARCH ORCHESTRA'));
    console.log('='.repeat(80));
    
    const researchOrchestra = new ResearchOrchestra(openai, logger, memory);
    console.log(chalk.cyan(`Orchestra: ${researchOrchestra.getInfo().name}`));
    console.log(chalk.gray(`Description: ${researchOrchestra.getInfo().description}`));
    
    await researchOrchestra.execute('Analyze the current trends in artificial intelligence and machine learning, focusing on practical business applications and future opportunities.');

    // Demo 3: Digital Consulting Orchestra
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.magenta('DEMO 3: DIGITAL CONSULTING ORCHESTRA'));
    console.log('='.repeat(80));
    
    const digitalOrchestra = new DigitalConsultingOrchestra(openai, logger, memory);
    console.log(chalk.cyan(`Orchestra: ${digitalOrchestra.getInfo().name}`));
    console.log(chalk.gray(`Description: ${digitalOrchestra.getInfo().description}`));
    
    await digitalOrchestra.execute('Help a mid-size retail company develop a digital transformation strategy, including e-commerce platform selection, digital marketing approach, and technology roadmap.');

    // Demo 4: Collaborative Orchestra (Multi-Shinobi)
    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.red('DEMO 4: COLLABORATIVE ORCHESTRA (MULTI-EXPERT)'));
    console.log('='.repeat(80));
    
    const collaborativeOrchestra = new CollaborativeOrchestra(openai, logger, memory);
    console.log(chalk.cyan(`Orchestra: ${collaborativeOrchestra.getInfo().name}`));
    console.log(chalk.gray(`Description: ${collaborativeOrchestra.getInfo().description}`));
    
    await collaborativeOrchestra.execute('I want to start a travel blog business that focuses on sustainable tourism. Help me with market research, content strategy, and business planning including potential revenue streams and digital marketing approach.');

    console.log('\n' + chalk.bold.green('🎉 All orchestration demos completed successfully!'));

    // Log demo completion and show stats if Supabase is enabled
    await memory.log({
      level: 'info',
      message: '🎉 AI Crew Orchestration Demo Completed',
      context: 'orchestration_demo',
      metadata: {
        event_type: 'demo_end'
      }
    });

    // Show execution statistics if database logging is enabled
    if (memory.isDatabaseLoggingEnabled()) {
      console.log('\n' + '='.repeat(80));
      console.log(chalk.bold.blue('ORCHESTRATION STATISTICS'));
      console.log('='.repeat(80));
      
      const stats = await memory.getExecutionStats();
      console.log(`📊 Total Executions: ${stats.total_executions}`);
      console.log(`💰 Total Cost: $${stats.total_cost.toFixed(6)}`);
      console.log(`🔢 Total Tokens: ${stats.total_tokens}`);
      console.log(`⏱️ Average Execution Time: ${stats.avg_execution_time.toFixed(2)}ms`);

      // Show recent logs
      console.log('\n' + chalk.bold.blue('RECENT ORCHESTRATION LOGS:'));
      const recentLogs = await memory.queryLogs({ limit: 10 });
      recentLogs.forEach(log => {
        const timestamp = log.timestamp.toLocaleTimeString();
        const level = log.level.toUpperCase();
        const context = log.context || 'general';
        console.log(`${timestamp} [${level}] [${context}] ${log.message}`);
      });
    }

  } catch (error) {
    await memory.log({
      level: 'error',
      message: '❌ Orchestration demo failed',
      context: 'orchestration_demo',
      metadata: {
        event_type: 'demo_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    console.error(chalk.red('❌ Orchestration demo failed:'), error);
    process.exit(1);
  }
}

// Run the demo
main();