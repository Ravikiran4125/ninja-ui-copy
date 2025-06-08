import dotenv from 'dotenv';
import { OpenAIService } from './openaiService.js';
import { Logger } from './utils/Logger.js';
import { Memory } from './core/memory.js';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🎓 OpenAI Teaching Examples\n');

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.log('Please set your OpenAI API key in the .env file');
    process.exit(1);
  }

  // Initialize Memory with Supabase (optional)
  const memory = new Memory({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    enableDatabaseLogging: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
    enableFileLogging: false, // Set to true if you want file logging
    defaultFilePath: './logs/execution.jsonl'
  });

  const logger = new Logger('info', undefined, memory);
  const openaiService = new OpenAIService(apiKey, logger, memory);

  try {
    // Log demo start
    await memory.log({
      level: 'info',
      message: '🎓 OpenAI Teaching Examples Demo Started',
      context: 'demo',
      metadata: {
        event_type: 'demo_start',
        supabase_enabled: memory.isDatabaseLoggingEnabled(),
        file_logging_enabled: memory.isFileLoggingEnabled()
      }
    });

    // Example 1: Shuriken Calling
    console.log('='.repeat(60));
    console.log('EXAMPLE 1: SHURIKEN CALLING');
    console.log('='.repeat(60));
    await openaiService.demonstrateShurikenCalling('What\'s the weather in Paris and what\'s 25 * 4?');

    // Example 2: Content Streaming
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 2: CONTENT STREAMING');
    console.log('='.repeat(60));
    await openaiService.demonstrateStreaming('Write a short poem about artificial intelligence');

    // Example 3: Structured Output
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 3: STRUCTURED OUTPUT');
    console.log('='.repeat(60));
    await openaiService.demonstrateStructuredOutput();

    // Example 4: Streaming Structured Output
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 4: STREAMING STRUCTURED OUTPUT');
    console.log('='.repeat(60));
    await openaiService.demonstrateStreamingStructuredOutput();

    // Example 5: Shinobi Multi-Kata Orchestration
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 5: SHINOBI MULTI-KATA ORCHESTRATION');
    console.log('='.repeat(60));
    await openaiService.demonstrateShinobi('I want to plan a trip to Paris in December. What\'s the weather like and what would be the cost for a 5-day trip for 2 people?');

    console.log('\n🎉 All examples completed successfully!');

    // Log demo completion and show stats if Supabase is enabled
    await memory.log({
      level: 'info',
      message: '🎉 OpenAI Teaching Examples Demo Completed',
      context: 'demo',
      metadata: {
        event_type: 'demo_end'
      }
    });

    // Show execution statistics if database logging is enabled
    if (memory.isDatabaseLoggingEnabled()) {
      console.log('\n' + '='.repeat(60));
      console.log('EXECUTION STATISTICS');
      console.log('='.repeat(60));
      
      const stats = await memory.getExecutionStats();
      console.log(`📊 Total Executions: ${stats.total_executions}`);
      console.log(`💰 Total Cost: $${stats.total_cost.toFixed(6)}`);
      console.log(`🔢 Total Tokens: ${stats.total_tokens}`);
      console.log(`⏱️ Average Execution Time: ${stats.avg_execution_time.toFixed(2)}ms`);
    }

  } catch (error) {
    await memory.log({
      level: 'error',
      message: '❌ Demo failed',
      context: 'demo',
      metadata: {
        event_type: 'demo_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
main();