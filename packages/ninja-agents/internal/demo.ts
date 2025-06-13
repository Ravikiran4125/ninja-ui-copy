import { Shinobi } from '../src/core/shinobi';
import { Shuriken } from '../src/core/shuriken';
import { Memory } from '../src/core/memory';
import { Logger } from '../src/utils/Logger';
import { KataRuntime } from '../src/core/kataRuntime';
import { openai } from './openaiClient';
import { z } from 'zod';

const logger = new Logger('info');
const memory = new Memory({});

const echoSchema = z.object({
  input: z.string().describe('The input string to echo back')
});

const echoShuriken = new Shuriken(
  'Echo',
  'Echoes back your input',
  echoSchema,
  async (params: { input: string }) => ({ output: params.input })
);

const runtime = new KataRuntime(openai, logger, memory);

const shinobi = new Shinobi(runtime, {
  role: 'Echo Shinobi',
  description: 'A Shinobi that echoes input.',
  backstory: 'A simple echo bot for internal testing.',
  katas: [
    {
      title: 'Echo Kata',
      description: 'Replies with the same message',
      shurikens: [echoShuriken],
      model: 'gpt-4o-mini'
    }
  ]
});

async function main() {
  const userQuery = 'Hello, ninja-agents!';
  const result = await shinobi.execute(userQuery);
  logger.info('Orchestration result:', result);
}

main().catch(e => {
  console.error('Demo error:', e);
  process.exit(1);
});