import { TestRunner } from '../testRunner.js';
import { z } from 'zod';

// Mock function to test zodToJsonSchema without requiring OpenAI
function zodToJsonSchema(schema: z.ZodSchema): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodSchema);
      
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
    return { type: 'string' };
  }

  if (schema instanceof z.ZodNumber) {
    return { type: 'number' };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema.element)
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema.options
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }

  return { type: 'string' };
}

export async function runOpenAIUtilsTests(): Promise<void> {
  const testRunner = new TestRunner();

  await testRunner.runTest('zodToJsonSchema - simple object', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
      active: z.boolean()
    });

    const jsonSchema = zodToJsonSchema(schema);
    
    if (jsonSchema.type !== 'object') {
      throw new Error('Should be object type');
    }
    if (!jsonSchema.properties.name || jsonSchema.properties.name.type !== 'string') {
      throw new Error('Should have string name property');
    }
    if (!jsonSchema.properties.age || jsonSchema.properties.age.type !== 'number') {
      throw new Error('Should have number age property');
    }
    if (!jsonSchema.properties.active || jsonSchema.properties.active.type !== 'boolean') {
      throw new Error('Should have boolean active property');
    }
  });

  await testRunner.runTest('zodToJsonSchema - with optional fields', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().optional()
    });

    const jsonSchema = zodToJsonSchema(schema);
    
    if (!jsonSchema.required.includes('name')) {
      throw new Error('Required field name should be in required array');
    }
    if (jsonSchema.required.includes('email')) {
      throw new Error('Optional field email should not be in required array');
    }
  });

  await testRunner.runTest('zodToJsonSchema - array type', () => {
    const schema = z.object({
      tags: z.array(z.string())
    });

    const jsonSchema = zodToJsonSchema(schema);
    
    if (jsonSchema.properties.tags.type !== 'array') {
      throw new Error('Should be array type');
    }
    if (jsonSchema.properties.tags.items.type !== 'string') {
      throw new Error('Array items should be string type');
    }
  });

  await testRunner.runTest('zodToJsonSchema - enum type', () => {
    const schema = z.object({
      status: z.enum(['active', 'inactive', 'pending'])
    });

    const jsonSchema = zodToJsonSchema(schema);
    
    if (jsonSchema.properties.status.type !== 'string') {
      throw new Error('Enum should be string type');
    }
    if (!Array.isArray(jsonSchema.properties.status.enum)) {
      throw new Error('Should have enum array');
    }
    if (jsonSchema.properties.status.enum.length !== 3) {
      throw new Error('Should have 3 enum values');
    }
  });

  testRunner.printSummary();
  
  if (testRunner.hasFailures()) {
    throw new Error('OpenAI utils tests failed');
  }
}