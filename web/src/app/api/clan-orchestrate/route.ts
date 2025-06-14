import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  Logger,
  Clan,
  KataRuntime,
} from 'ninja-agents';
import { exampleClan } from '@/app/services/ninja-agents/clan/exampleClan';
import webSearchShuriken from '@/app/services/ninja-agents/shurikens/webSearchShuriken';
import fileManagerShuriken from '@/app/services/ninja-agents/shurikens/fileManagerShuriken';

const apiLogger = new Logger('info', 'APIClanRoute');

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
      apiLogger.warn('Clan orchestration request failed: Missing or invalid userQuery');
      return NextResponse.json(
        { error: 'userQuery (string) is required in the request body' },
        { status: 400 }
      );
    }

    apiLogger.info('Clan orchestration request received', { userQuery });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      apiLogger.error('Server configuration error: OPENAI_API_KEY is not set.');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const logger = new Logger('info', 'ClanDemo');
    const runtime = new KataRuntime(openai, logger);

    // Create and execute Clan
    apiLogger.info(`Executing Clan with user query: "${userQuery}"`);
    const startTime = Date.now();

    const clan = new Clan(runtime, {
      ...exampleClan,
      shinobi: exampleClan.shinobi.map(shinobiConfig => ({
        ...shinobiConfig,
        shurikens: [webSearchShuriken, fileManagerShuriken]
      }))
    });

    apiLogger.debug(`Clan '${clan.getInfo().name}' initialized with ${clan.getInfo().shinobiCount} Shinobi`);

    const executionResult = await clan.execute(userQuery);
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;

    apiLogger.info(`Clan execution completed in ${executionTimeMs}ms.`);

    // Extract the final result based on strategy
    let finalAnswer = '';
    if (executionResult.result.strategy === 'collaborative' && executionResult.result.synthesis) {
      finalAnswer = executionResult.result.synthesis;
    } else if (executionResult.result.summary) {
      finalAnswer = executionResult.result.summary;
    } else {
      finalAnswer = 'Clan execution completed successfully. Multiple perspectives have been analyzed.';
    }

    apiLogger.info('Successfully orchestrated Clan and sending response.', { 
      finalAnswerLength: finalAnswer.length, 
      clanId: clan.getInfo().id 
    });

    return NextResponse.json({
      execution: executionResult,
      response: finalAnswer,
      clanId: clan.getInfo().id,
      executionTimeMs,
      strategy: executionResult.result.strategy,
      shinobiCount: clan.getInfo().shinobiCount
    });

  } catch (error) {
    const errorLogger = apiLogger || new Logger('error', 'APIClanErrorCatch');
    errorLogger.error('Unhandled clan orchestration error in API route:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorDetails: error,
    });
    return NextResponse.json(
      { error: 'Failed to orchestrate clan due to an unexpected server error.', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}