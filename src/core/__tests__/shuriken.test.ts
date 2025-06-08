import { TestRunner } from '../../utils/testRunner.js';
import { Shuriken } from '../shuriken.js';
import { z } from 'zod';

export async function runShurikenTests(): Promise<void> {
  const testRunner = new TestRunner();

  await testRunner.runTest('Shuriken creation and basic properties', () => {
    const schema = z.object({
      message: z.string()
    });
    
    const shuriken = new Shuriken(
      'test_function',
      'A test function',
      schema,
      (params: any) => ({ result: `Hello ${params.message}` })
    );

    if (shuriken.getName() !== 'test_function') {
      throw new Error('Name should match constructor parameter');
    }
    if (shuriken.getDescription() !== 'A test function') {
      throw new Error('Description should match constructor parameter');
    }
    if (typeof shuriken.getId() !== 'string') {
      throw new Error('ID should be a string');
    }
  });

  await testRunner.runTest('Shuriken forge creates valid OpenAI tool definition', () => {
    const schema = z.object({
      city: z.string().describe('The city name'),
      unit: z.enum(['celsius', 'fahrenheit']).optional()
    });
    
    const shuriken = new Shuriken(
      'get_weather',
      'Get weather information',
      schema,
      () => ({})
    );

    const toolDef = shuriken.forge();
    
    if (toolDef.type !== 'function') {
      throw new Error('Tool type should be function');
    }
    if (toolDef.function.name !== 'get_weather') {
      throw new Error('Function name should match shuriken name');
    }
    if (toolDef.function.description !== 'Get weather information') {
      throw new Error('Function description should match shuriken description');
    }
    if (!toolDef.function.parameters) {
      throw new Error('Function should have parameters');
    }
  });

  await testRunner.runTest('Shuriken parameter validation', () => {
    const schema = z.object({
      a: z.number(),
      b: z.number()
    });
    
    const shuriken = new Shuriken(
      'add',
      'Add two numbers',
      schema,
      (params: any) => params.a + params.b
    );

    // Valid parameters
    const validResult = shuriken.validate({ a: 5, b: 3 });
    if (!validResult.success) {
      throw new Error('Valid parameters should pass validation');
    }

    // Invalid parameters
    const invalidResult = shuriken.validate({ a: 'not a number', b: 3 });
    if (invalidResult.success) {
      throw new Error('Invalid parameters should fail validation');
    }
  });

  await testRunner.runTest('Shuriken execution with valid parameters', async () => {
    const schema = z.object({
      message: z.string()
    });
    
    const shuriken = new Shuriken(
      'echo',
      'Echo a message',
      schema,
      (params: any) => `Echo: ${params.message}`
    );

    const result = await shuriken.execute({ message: 'Hello World' });
    
    if (result.result !== 'Echo: Hello World') {
      throw new Error('Execution result should match expected output');
    }
    if (typeof result.executionTime !== 'number') {
      throw new Error('Execution time should be a number');
    }
  });

  await testRunner.runTest('Shuriken execution with invalid parameters', async () => {
    const schema = z.object({
      number: z.number()
    });
    
    const shuriken = new Shuriken(
      'square',
      'Square a number',
      schema,
      (params: any) => params.number * params.number
    );

    try {
      await shuriken.execute({ number: 'not a number' });
      throw new Error('Should have thrown validation error');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Parameter validation failed')) {
        throw new Error('Should throw parameter validation error');
      }
    }
  });

  testRunner.printSummary();
  
  if (testRunner.hasFailures()) {
    throw new Error('Shuriken tests failed');
  }
}