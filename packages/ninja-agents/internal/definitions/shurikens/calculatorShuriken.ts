import { z } from 'zod';
import { Shuriken } from '../../../src/core/shuriken';

const calculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The mathematical operation to perform'),
  a: z.number().describe('First number'),
  b: z.number().describe('Second number')
});

async function calculatorImplementation(params: { operation: string; a: number; b: number }) {
  let result: number;
  
  switch (params.operation) {
    case 'add':
      result = params.a + params.b;
      break;
    case 'subtract':
      result = params.a - params.b;
      break;
    case 'multiply':
      result = params.a * params.b;
      break;
    case 'divide':
      if (params.b === 0) {
        return { error: 'Division by zero is not allowed' };
      }
      result = params.a / params.b;
      break;
    default:
      return { error: `Unknown operation: ${params.operation}` };
  }
  
  return {
    operation: params.operation,
    operands: [params.a, params.b],
    result,
    formatted: `${params.a} ${params.operation === 'add' ? '+' : params.operation === 'subtract' ? '-' : params.operation === 'multiply' ? '×' : '÷'} ${params.b} = ${result}`
  };
}

export const calculatorShuriken = new Shuriken(
  'Calculator',
  'Perform basic math operations.',
  calculatorSchema,
  calculatorImplementation
);