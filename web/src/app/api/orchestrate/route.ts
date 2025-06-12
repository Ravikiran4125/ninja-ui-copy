import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  Logger,
  // Memory,
  Shinobi,
  KataRuntime,
} from 'ninja-agents';
import { researchDirectorShinobi } from '@/app/services/ninja-agents/shinobi/researchDirectorShinobi';
import webSearchShuriken from '@/app/services/ninja-agents/shurikens/webSearchShuriken';
import fileManagerShuriken from '@/app/services/ninja-agents/shurikens/fileManagerShuriken';

const apiLogger = new Logger('info', 'APIOrchestrateRoute');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let userQuery: string | undefined;

    if (body && Array.isArray(body.messages) && body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1];
      if (lastMessage && typeof lastMessage.content === 'string' && lastMessage.content.trim() !== '') {
        userQuery = lastMessage.content.trim();
      }
    }

    // If userQuery wasn't found in messages or was empty, try to get it directly from body.userQuery
    if (!userQuery && body && body.userQuery && typeof body.userQuery === 'string' && body.userQuery.trim() !== '') {
      userQuery = body.userQuery.trim();
    }
    if (!userQuery || typeof userQuery !== 'string') {
      apiLogger.warn('Orchestration request failed: Missing or invalid userQuery');
      return NextResponse.json(
        { error: 'userQuery (string) is required in the request body' },
        { status: 400 }
      );
    }
    apiLogger.info('Orchestration request received', { userQuery });

    const apiKey = process.env.OPENAI_API_KEY;
    console.log(apiKey, 'OpenAI API Key')
    if (!apiKey) {
      apiLogger.error('Server configuration error: OPENAI_API_KEY is not set.');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const memory = new Memory({}); // Basic memory, can be enhanced later

    // Execute Shinobi workflow
    apiLogger.info(`Executing Shinobi with user query: "${userQuery}"`);
    const startTime = Date.now();
    const logger = new Logger('info', 'OrchestrationDemo');

    const runtime = new KataRuntime(openai, logger)

    const shinobi = new Shinobi(runtime, {
        ...researchDirectorShinobi,
        shurikens: [webSearchShuriken, fileManagerShuriken]
    });

    apiLogger.debug(`Shinobi '${shinobi.getConfig().role}' initialized with ID: ${shinobi.getId()}`);


    const executionResult = await shinobi.execute(userQuery);
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    apiLogger.info(`Shinobi execution completed in ${executionTimeMs}ms.`);

    console.log(executionResult, "executionResult")
    // Extract and return the final answer
    // The 'ExecutionResult' type does not have an 'error' field; errors are thrown.
    const finalAnswer = executionResult.result?.finalAnswer;

    if (finalAnswer === undefined) {
      apiLogger.error('Final answer was not found in Shinobi execution result.', { executionResult });
      return NextResponse.json(
        { error: 'Failed to get a final answer from the Shinobi', details: 'The finalAnswer field was missing in the execution result.' },
        { status: 500 }
      );
    }

    apiLogger.info('Successfully orchestrated Shinobi and sending response.', { finalAnswerLength: finalAnswer.length, shinobiId: shinobi.getId() });

    return NextResponse.json({
      response: finalAnswer,
      shinobiId: shinobi.getId(),
      executionTimeMs,
      billingInfo: executionResult.billingInfo, // Optionally include billing info
    });

  } catch (error) {
    // Log the error using the apiLogger or a new Logger instance if apiLogger is not in scope (though it should be)
    const errorLogger = apiLogger || new Logger('error', 'APIOrchestrateErrorCatch'); // Corrected logger instantiation
    errorLogger.error('Unhandled orchestration error in API route:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorDetails: error,
    });
    return NextResponse.json(
      { error: 'Failed to orchestrate agent due to an unexpected server error.', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
