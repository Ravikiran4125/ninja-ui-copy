import { randomUUID } from 'crypto';
import { z } from 'zod';
import OpenAI from 'openai';
import type { ExecutionResult } from './types.js';

/**
 * Represents an AI capability or function that can be invoked by an AI agent (Kata).
 * Shurikens encapsulate both the definition (for OpenAI tool calling) and the
 * implementation of a specific function.
 * 
 * @example
 * ```typescript
 * const weatherShuriken = new Shuriken(
 *   'get_weather',
 *   'Get current weather information for a specific city',
 *   z.object({
 *     city: z.string().describe('The city name'),
 *     unit: z.enum(['celsius', 'fahrenheit']).optional()
 *   }),
 *   async (params) => {
 *     // Implementation logic here
 *     return { temperature: 25, condition: 'Sunny' };
 *   }
 * );
 * ```
 */
export class Shuriken {
  private title: string;
  private description: string;
  private schema: z.ZodSchema;
  private implementation: Function;
  private shurikenId: string;

  /**
   * Creates an instance of Shuriken.
   * 
   * @param title The name of the shuriken, used as the function name in OpenAI tool calls.
   * @param description A brief description of what the shuriken does. This helps the AI decide when to use it.
   * @param schema A Zod schema defining the expected parameters for the shuriken's implementation.
   * @param implementation The actual JavaScript/TypeScript function that performs the shuriken's logic.
   * 
   * @example
   * ```typescript
   * const calculator = new Shuriken(
   *   'calculate',
   *   'Perform basic mathematical operations',
   *   z.object({
   *     operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
   *     a: z.number(),
   *     b: z.number()
   *   }),
   *   (params) => {
   *     switch (params.operation) {
   *       case 'add': return params.a + params.b;
   *       case 'subtract': return params.a - params.b;
   *       case 'multiply': return params.a * params.b;
   *       case 'divide': return params.a / params.b;
   *     }
   *   }
   * );
   * ```
   */
  constructor(title: string, description: string, schema: z.ZodSchema, implementation: Function) {
    this.title = title;
    this.description = description;
    this.schema = schema;
    this.implementation = implementation;
    this.shurikenId = randomUUID();
  }

  /**
   * Converts the internal Zod schema to a JSON Schema format compatible with OpenAI's tool definitions.
   * This method recursively processes the Zod schema to build the corresponding JSON Schema.
   * 
   * @param schema The Zod schema to convert.
   * @returns A JSON Schema object representing the Zod schema.
   * @private
   */
  private zodToJsonSchema(schema: z.ZodSchema): any {
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const properties: any = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        properties[key] = this.zodToJsonSchema(value as z.ZodSchema);
        
        // Check if field is required (not optional)
        if (!(value as any).isOptional()) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
        additionalProperties: false
      };
    }

    if (schema instanceof z.ZodString) {
      const result: any = { type: 'string' };
      
      // Handle enums
      if ((schema as any)._def.checks) {
        const enumCheck = (schema as any)._def.checks.find((check: any) => check.kind === 'includes');
        if (enumCheck) {
          result.enum = enumCheck.value;
        }
      }
      
      // Handle description
      if ((schema as any)._def.description) {
        result.description = (schema as any)._def.description;
      }
      
      return result;
    }

    if (schema instanceof z.ZodNumber) {
      const result: any = { type: 'number' };
      if ((schema as any)._def.description) {
        result.description = (schema as any)._def.description;
      }
      return result;
    }

    if (schema instanceof z.ZodBoolean) {
      const result: any = { type: 'boolean' };
      if ((schema as any)._def.description) {
        result.description = (schema as any)._def.description;
      }
      return result;
    }

    if (schema instanceof z.ZodArray) {
      return {
        type: 'array',
        items: this.zodToJsonSchema(schema.element)
      };
    }

    if (schema instanceof z.ZodEnum) {
      return {
        type: 'string',
        enum: schema.options
      };
    }

    if (schema instanceof z.ZodOptional) {
      return this.zodToJsonSchema(schema.unwrap());
    }

    // Fallback for unsupported types
    return { type: 'string' };
  }

  /**
   * Generates the OpenAI tool definition for this shuriken.
   * This definition is used by OpenAI models to understand and call the shuriken.
   * 
   * @returns An OpenAI ChatCompletionTool object.
   * 
   * @example
   * ```typescript
   * const weatherShuriken = new Shuriken(
   *   'get_weather',
   *   'Get current weather information',
   *   z.object({ city: z.string() }),
   *   async (params) => ({ temperature: 25, condition: 'Sunny' })
   * );
   * const toolDefinition = weatherShuriken.forge();
   * // toolDefinition will be:
   * // {
   * //   type: 'function',
   * //   function: {
   * //     name: 'get_weather',
   * //     description: 'Get current weather information',
   * //     parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] }
   * //   }
   * // }
   * ```
   */
  forge(): OpenAI.Chat.Completions.ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: this.title,
        description: this.description,
        parameters: this.zodToJsonSchema(this.schema)
      }
    };
  }

  /**
   * Validates the given parameters against the shuriken's defined Zod schema.
   * 
   * @param parameters The parameters to validate.
   * @returns An object indicating success or failure, with data or error details.
   * 
   * @example
   * ```typescript
   * const validation = shuriken.validate({ city: 'Paris' });
   * if (validation.success) {
   *   console.log('Valid parameters:', validation.data);
   * } else {
   *   console.error('Validation error:', validation.error);
   * }
   * ```
   */
  validate(parameters: any): { success: boolean; data?: any; error?: string } {
    try {
      const result = this.schema.parse(parameters);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { 
          success: false, 
          error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        };
      }
      return { success: false, error: 'Unknown validation error' };
    }
  }

  /**
   * Executes the shuriken's underlying implementation function with the provided parameters.
   * Parameters are validated against the schema before execution.
   * 
   * @param parameters The parameters to pass to the shuriken's implementation.
   * @returns A promise that resolves to an ExecutionResult containing the result and execution time.
   * @throws {Error} If parameter validation fails or if the shuriken's implementation throws an error.
   * 
   * @example
   * ```typescript
   * const calculator = new Shuriken(
   *   'add',
   *   'Adds two numbers',
   *   z.object({ a: z.number(), b: z.number() }),
   *   (params) => params.a + params.b
   * );
   * 
   * try {
   *   const result = await calculator.execute({ a: 5, b: 3 });
   *   console.log('Result:', result.result); // 8
   *   console.log('Execution time:', result.executionTime); // e.g., 2
   * } catch (error) {
   *   console.error('Execution failed:', error.message);
   * }
   * ```
   */
  async execute(parameters: any): Promise<ExecutionResult<any>> {
    const startTime = Date.now();
    
    const validation = this.validate(parameters);
    if (!validation.success) {
      throw new Error(`Parameter validation failed: ${validation.error}`);
    }

    try {
      const result = await this.implementation(validation.data);
      const executionTime = Date.now() - startTime;
      
      return {
        result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      throw new Error(`Shuriken execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the unique identifier for this shuriken.
   * 
   * @returns The shuriken's UUID.
   */
  getId(): string {
    return this.shurikenId;
  }

  /**
   * Gets the name (title) of the shuriken.
   * 
   * @returns The shuriken's name.
   */
  getName(): string {
    return this.title;
  }

  /**
   * Gets the description of the shuriken.
   * 
   * @returns The shuriken's description.
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Gets the underlying implementation function of the shuriken.
   * 
   * @returns The shuriken's implementation function.
   */
  getImplementation(): Function {
    return this.implementation;
  }

  /**
   * Gets the Zod schema used for validating the shuriken's parameters.
   * 
   * @returns The shuriken's Zod schema.
   */
  getSchema(): z.ZodSchema {
    return this.schema;
  }
}