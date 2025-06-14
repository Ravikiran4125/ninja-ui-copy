import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  Logger,
  Dojo,
  Shinobi,
  KataRuntime,
} from 'ninja-agents';
import { exampleDojo } from '@/app/services/ninja-agents/dojo/exampleDojo';
import webSearchShuriken from '@/app/services/ninja-agents/shurikens/webSearchShuriken';
import fileManagerShuriken from '@/app/services/ninja-agents/shurikens/fileManagerShuriken';

const apiLogger = new Logger('info', 'APIDojoRoute');

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

    if (!userQuery && body && body.userQuery && typeof body.userQuery === 'string' && body.userQuery.trim() !== '') {
      userQuery = body.userQuery.trim();
    }

    if (!userQuery || typeof userQuery !== 'string') {
      apiLogger.warn('Dojo orchestration request failed: Missing or invalid userQuery');
      return NextResponse.json(
        { error: 'userQuery (string) is required in the request body' },
        { status: 400 }
      );
    }

    apiLogger.info('Dojo orchestration request received', { userQuery });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      apiLogger.error('Server configuration error: OPENAI_API_KEY is not set.');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const logger = new Logger('info', 'DojoDemo');
    const runtime = new KataRuntime(openai, logger);

    // Create Dojo workflow
    apiLogger.info(`Executing Dojo workflow with user query: "${userQuery}"`);
    const startTime = Date.now();

    const dojo = new Dojo(runtime, exampleDojo);

    // Build the workflow using the fluent API
    const workflow = dojo
      .start(new Shinobi(runtime, {
        ...exampleDojo.steps[0].config,
        shurikens: [webSearchShuriken, fileManagerShuriken]
      }))
      .then(new Shinobi(runtime, {
        ...exampleDojo.steps[1].config,
        shurikens: [webSearchShuriken, fileManagerShuriken]
      }));

    apiLogger.debug(`Dojo workflow '${dojo.getInfo().name}' initialized with ${dojo.getInfo().stepCount} steps`);

    const executionResult = await workflow.execute(userQuery);
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;

    apiLogger.info(`Dojo execution completed in ${executionTimeMs}ms.`);

    // Extract the final result
    const finalResult = executionResult.result.finalResult;
    let finalAnswer = '';
    
    if (finalResult && finalResult.result && finalResult.result.finalAnswer) {
      finalAnswer = finalResult.result.finalAnswer;
    } else if (finalResult && typeof finalResult === 'string') {
      finalAnswer = finalResult;
    } else {
      finalAnswer = 'Dojo workflow completed successfully. Sequential analysis has been performed.';
    }

    apiLogger.info('Successfully orchestrated Dojo and sending response.', { 
      finalAnswerLength: finalAnswer.length, 
      dojoId: dojo.getInfo().id 
    });

    return NextResponse.json({
      execution: executionResult,
      response: finalAnswer,
      dojoId: dojo.getInfo().id,
      executionTimeMs,
      stepCount: dojo.getInfo().stepCount,
      steps: executionResult.result.steps
    });

  } catch (error) {
    const errorLogger = apiLogger || new Logger('error', 'APIDojoErrorCatch');
    errorLogger.error('Unhandled dojo orchestration error in API route:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorDetails: error,
    });
    return NextResponse.json(
      { error: 'Failed to orchestrate dojo due to an unexpected server error.', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}