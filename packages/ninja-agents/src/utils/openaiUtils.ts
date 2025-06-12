import OpenAI from 'openai';
import { z } from 'zod';
import type { TokenUsage, OpenAIParameters, ExecutionResult } from '../core/types.js';
import { createBillingInfo } from './billingCalculator.js';

export interface GenerateTextOptions {
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  tool_choice?: 'auto' | 'none' | OpenAI.Chat.Completions.ChatCompletionNamedToolChoice;
  parameters?: OpenAIParameters;
}

export interface StreamTextOptions extends GenerateTextOptions {
  onChunk?: (chunk: string) => void;
}

export interface GenerateObjectOptions extends GenerateTextOptions {
  schema: z.ZodSchema;
}

export interface StreamObjectOptions extends GenerateObjectOptions {
  onChunk?: (chunk: string) => void;
}

/**
 * Apply default OpenAI parameters
 */
function applyDefaultParameters(parameters?: OpenAIParameters): OpenAIParameters {
  return {
    temperature: 1.0,
    top_p: 1.0,
    n: 1,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
    ...parameters
  };
}

/**
 * Extract token usage from OpenAI response
 */
function extractTokenUsage(response: OpenAI.Chat.Completions.ChatCompletion): TokenUsage | undefined {
  if (!response.usage) return undefined;
  
  return {
    prompt_tokens: response.usage.prompt_tokens,
    completion_tokens: response.usage.completion_tokens,
    total_tokens: response.usage.total_tokens,
    prompt_tokens_details: response.usage.prompt_tokens_details,
    completion_tokens_details: response.usage.completion_tokens_details
  };
}

/**
 * Generate text using OpenAI API with token tracking
 */
export async function generateText(
  openai: OpenAI,
  options: GenerateTextOptions
): Promise<ExecutionResult<string>> {
  const startTime = Date.now();
  const params = applyDefaultParameters(options.parameters);

  const response = await openai.chat.completions.create({
    model: options.model,
    messages: options.messages,
    tools: options.tools,
    tool_choice: options.tool_choice,
    stream: false,
    ...params
  });

  const executionTime = Date.now() - startTime;
  const content = response.choices[0]?.message?.content || '';
  const tokenUsage = extractTokenUsage(response);

  return {
    result: content,
    tokenUsage,
    billingInfo: tokenUsage ? createBillingInfo(options.model, tokenUsage) : undefined,
    executionTime
  };
}

/**
 * Stream text using OpenAI API with token tracking
 */
export async function streamText(
  openai: OpenAI,
  options: StreamTextOptions
): Promise<ExecutionResult<string>> {
  const startTime = Date.now();
  const params = applyDefaultParameters(options.parameters);

  const stream = await openai.chat.completions.create({
    model: options.model,
    messages: options.messages,
    tools: options.tools,
    tool_choice: options.tool_choice,
    stream: true,
    stream_options: { include_usage: true },
    ...params
  });

  let fullContent = '';
  let tokenUsage: TokenUsage | undefined;
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullContent += content;
      if (options.onChunk) {
        options.onChunk(content);
      }
    }

    // Extract usage from the final chunk
    if (chunk.usage) {
      tokenUsage = {
        prompt_tokens: chunk.usage.prompt_tokens,
        completion_tokens: chunk.usage.completion_tokens,
        total_tokens: chunk.usage.total_tokens,
        prompt_tokens_details: chunk.usage.prompt_tokens_details,
        completion_tokens_details: chunk.usage.completion_tokens_details
      };
    }
  }

  const executionTime = Date.now() - startTime;

  return {
    result: fullContent,
    tokenUsage,
    billingInfo: tokenUsage ? createBillingInfo(options.model, tokenUsage) : undefined,
    executionTime
  };
}

/**
 * Generate structured object using OpenAI API with token tracking
 */
export async function generateObject<T>(
  openai: OpenAI,
  options: GenerateObjectOptions
): Promise<ExecutionResult<T>> {
  const startTime = Date.now();
  const params = applyDefaultParameters(options.parameters);

  // Convert Zod schema to JSON Schema
  const jsonSchema = zodToJsonSchema(options.schema);

  const response = await openai.chat.completions.create({
    model: options.model,
    messages: options.messages,
    tools: options.tools,
    tool_choice: options.tool_choice,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'structured_output',
        schema: jsonSchema
      }
    },
    stream: false,
    ...params
  });

  const executionTime = Date.now() - startTime;
  const content = response.choices[0]?.message?.content || '{}';
  const result = JSON.parse(content) as T;
  const tokenUsage = extractTokenUsage(response);

  return {
    result,
    tokenUsage,
    billingInfo: tokenUsage ? createBillingInfo(options.model, tokenUsage) : undefined,
    executionTime
  };
}

/**
 * Stream object with token tracking (falls back to JSON mode since json_schema doesn't support streaming)
 */
export async function streamObject<T>(
  openai: OpenAI,
  options: StreamObjectOptions
): Promise<ExecutionResult<T>> {
  const startTime = Date.now();
  const params = applyDefaultParameters(options.parameters);

  // Generate JSON schema from Zod schema
  const jsonSchema = zodToJsonSchema(options.schema);
  
  // Create system message with explicit schema instructions
  const schemaInstruction: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: 'system',
    content: `You must respond with a valid JSON object that strictly conforms to this JSON schema:

${JSON.stringify(jsonSchema, null, 2)}

Ensure all required fields are present and have the correct data types. Do not include any additional text or explanation, only the JSON object.`
  };

  // Note: OpenAI doesn't support streaming with json_schema, so we use json_object mode
  // and validate the result afterwards
  const stream = await openai.chat.completions.create({
    model: options.model,
    messages: [
      schemaInstruction,
      ...options.messages.slice(0, -1),
      {
        ...options.messages[options.messages.length - 1],
        content: `${options.messages[options.messages.length - 1].content}\n\nPlease respond with valid JSON only that matches the required schema.`
      }
    ],
    tools: options.tools,
    tool_choice: options.tool_choice,
    response_format: { type: 'json_object' },
    stream: true,
    stream_options: { include_usage: true },
    ...params
  });

  let fullContent = '';
  let tokenUsage: TokenUsage | undefined;
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullContent += content;
      if (options.onChunk) {
        options.onChunk(content);
      }
    }

    // Extract usage from the final chunk
    if (chunk.usage) {
      tokenUsage = {
        prompt_tokens: chunk.usage.prompt_tokens,
        completion_tokens: chunk.usage.completion_tokens,
        total_tokens: chunk.usage.total_tokens,
        prompt_tokens_details: chunk.usage.prompt_tokens_details,
        completion_tokens_details: chunk.usage.completion_tokens_details
      };
    }
  }

  const executionTime = Date.now() - startTime;

  try {
    const parsed = JSON.parse(fullContent);
    // Validate against schema
    const result = options.schema.parse(parsed);
    return {
      result: result as T,
      tokenUsage,
      billingInfo: tokenUsage ? createBillingInfo(options.model, tokenUsage) : undefined,
      executionTime
    };
  } catch (error) {
    throw new Error(`Failed to parse or validate streamed JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Zod schema to JSON Schema format
 */
export function zodToJsonSchema(schema: z.ZodSchema): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodSchema);
      
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

  // Fallback for unsupported types
  return { type: 'string' };
}