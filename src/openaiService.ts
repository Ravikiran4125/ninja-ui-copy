import OpenAI from 'openai';
import { z } from 'zod';
import { Logger } from './utils/Logger.js';
import { Memory } from './core/memory.js';
import { Shuriken, Kata, KataRuntime, Shinobi } from './core/index.js';

export interface WeatherShuriken {
  name: 'get_weather';
  parameters: {
    city: string;
    unit?: 'celsius' | 'fahrenheit';
  };
}

export interface CalculatorShuriken {
  name: 'calculate';
  parameters: {
    operation: 'add' | 'subtract' | 'multiply' | 'divide';
    a: number;
    b: number;
  };
}

export interface ProductInfo {
  name: string;
  description: string;
  price: number;
  category: string;
  features: string[];
  inStock: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  email: string;
  interests: string[];
  location: {
    city: string;
    country: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
}

export class OpenAIService {
  private openai: OpenAI;
  private logger: Logger;
  private memory?: Memory;

  constructor(apiKey: string, logger: Logger, memory?: Memory) {
    this.openai = new OpenAI({ apiKey });
    this.logger = logger;
    this.memory = memory;
  }

  /**
   * FEATURE 1: Shuriken Calling using Kata
   * Demonstrates how to use the Kata class for shuriken calling
   */
  async demonstrateShurikenCalling(userQuery: string): Promise<void> {
    this.logger.info('🔧 Starting Shuriken Calling Demo with Kata');

    // Create runtime for dependency injection
    const runtime = new KataRuntime(this.openai, this.logger, this.memory);

    // Define weather shuriken with implementation
    const weatherSchema = z.object({
      city: z.string().describe('The city name to get weather for'),
      unit: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature unit preference')
    });
    const weatherShuriken = new Shuriken(
      'get_weather', 
      'Get current weather information for a specific city', 
      weatherSchema,
      (params: any) => this.getWeather(params.city, params.unit || 'celsius')
    );

    // Define calculator shuriken with implementation
    const calculatorSchema = z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The mathematical operation to perform'),
      a: z.number().describe('First number'),
      b: z.number().describe('Second number')
    });
    const calculatorShuriken = new Shuriken(
      'calculate', 
      'Perform basic mathematical calculations', 
      calculatorSchema,
      (params: any) => this.calculate(params.operation, params.a, params.b)
    );

    // Create a kata for shuriken calling with initial shurikens and custom parameters
    const shurikenCallingKata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Shuriken Calling Assistant',
      description: 'You are a helpful assistant that can use shurikens to provide accurate information about weather and perform calculations. Always provide complete, final answers without asking for additional input.',
      shurikens: [weatherShuriken, calculatorShuriken],
      requiresHumanInput: false,
      parameters: {
        temperature: 0.7,
        max_tokens: 1000
      }
    });

    // Execute the kata
    const result = await shurikenCallingKata.execute(userQuery);
    
    // Log summary
    this.logger.info(`📊 Kata Summary:`);
    this.logger.info(`   Total Cost: $${shurikenCallingKata.getTotalEstimatedCost().toFixed(6)}`);
    const totalTokens = shurikenCallingKata.getTotalTokenUsage();
    this.logger.info(`   Total Tokens: ${totalTokens.total_tokens}`);
  }

  /**
   * Mock weather function - in real app, this would call a weather API
   */
  private async getWeather(city: string, unit: 'celsius' | 'fahrenheit') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const temp = unit === 'celsius' ? 22 : 72;
    const unitSymbol = unit === 'celsius' ? '°C' : '°F';
    
    return {
      city,
      temperature: temp,
      unit: unitSymbol,
      condition: 'Partly cloudy',
      humidity: 65,
      windSpeed: '10 km/h'
    };
  }

  /**
   * Calculator function
   */
  private async calculate(operation: string, a: number, b: number) {
    let result: number;
    
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return { error: 'Division by zero is not allowed' };
        }
        result = a / b;
        break;
      default:
        return { error: `Unknown operation: ${operation}` };
    }
    
    return {
      operation,
      operands: [a, b],
      result
    };
  }

  /**
   * FEATURE 2: Content Streaming using Kata
   * Demonstrates real-time content generation with Kata
   */
  async demonstrateStreaming(prompt: string): Promise<void> {
    this.logger.info('🌊 Starting Content Streaming Demo with Kata');
    
    // Create runtime for dependency injection
    const runtime = new KataRuntime(this.openai, this.logger, this.memory);
    
    // Create a streaming kata with custom parameters
    const streamingKata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Creative Writing Assistant',
      description: 'You are a creative writer. Write engaging and detailed content. Provide complete creative works without asking for additional input.',
      stream: true, // Enable streaming
      requiresHumanInput: false,
      parameters: {
        temperature: 0.9,
        max_tokens: 500,
        presence_penalty: 0.1
      }
    });

    // Execute the kata with streaming
    const result = await streamingKata.execute(prompt);
    
    // Log summary
    this.logger.info(`📊 Streaming Summary:`);
    this.logger.info(`   Total Cost: $${streamingKata.getTotalEstimatedCost().toFixed(6)}`);
    const totalTokens = streamingKata.getTotalTokenUsage();
    this.logger.info(`   Total Tokens: ${totalTokens.total_tokens}`);
  }

  /**
   * FEATURE 3: Structured Output using Kata
   * Demonstrates generating content that conforms to a specific schema
   */
  async demonstrateStructuredOutput(): Promise<void> {
    this.logger.info('📋 Starting Structured Output Demo with Kata');
    
    // Create runtime for dependency injection
    const runtime = new KataRuntime(this.openai, this.logger, this.memory);
    
    // Define schemas for structured output
    const productInfoSchema = z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      category: z.string(),
      features: z.array(z.string()),
      inStock: z.boolean()
    });

    const userProfileSchema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string(),
      interests: z.array(z.string()),
      location: z.object({
        city: z.string(),
        country: z.string()
      }),
      preferences: z.object({
        newsletter: z.boolean(),
        notifications: z.boolean()
      })
    });

    // Create structured output kata for product generation
    const productKata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Product Information Generator',
      description: 'You are a product manager creating detailed product listings. Generate complete product information without asking for additional details.',
      responseSchema: productInfoSchema,
      requiresHumanInput: false,
      parameters: {
        temperature: 0.8,
        max_tokens: 800
      }
    });

    // Create structured output kata for user profile generation
    const userKata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'User Profile Generator',
      description: 'You are a user registration system generating realistic user profiles. Create complete profiles without asking for additional information.',
      responseSchema: userProfileSchema,
      requiresHumanInput: false,
      parameters: {
        temperature: 0.6,
        max_tokens: 600
      }
    });

    // Generate product info
    this.logger.info('🛍️ Generating Product Information...');
    const productResult = await productKata.execute('Create a product listing for high-tech wireless headphones');
    
    console.log('\n' + '-'.repeat(40) + '\n');
    
    // Generate user profile
    this.logger.info('👤 Generating User Profile...');
    const userResult = await userKata.execute('Create a user profile for a tech-savvy professional in their 30s');
    
    // Log combined summary
    this.logger.info(`📊 Structured Output Summary:`);
    const productCost = productKata.getTotalEstimatedCost();
    const userCost = userKata.getTotalEstimatedCost();
    this.logger.info(`   Product Kata Cost: $${productCost.toFixed(6)}`);
    this.logger.info(`   User Kata Cost: $${userCost.toFixed(6)}`);
    this.logger.info(`   Total Cost: $${(productCost + userCost).toFixed(6)}`);
  }

  /**
   * FEATURE 4: Streaming Structured Output using Kata
   * Demonstrates streaming content that conforms to a schema (using JSON mode)
   */
  async demonstrateStreamingStructuredOutput(): Promise<void> {
    this.logger.info('🌊📋 Starting Streaming Structured Output Demo with Kata');
    
    // Create runtime for dependency injection
    const runtime = new KataRuntime(this.openai, this.logger, this.memory);
    
    const storySchema = z.object({
      title: z.string(),
      genre: z.string(),
      characters: z.array(z.string()),
      plot: z.string(),
      setting: z.string(),
      wordCount: z.number()
    });

    // Create streaming structured output kata with advanced parameters
    const streamingStructuredKata = new Kata(runtime, {
      model: 'gpt-4o-mini',
      title: 'Story Generator',
      description: 'You are a creative writer that generates detailed story outlines in JSON format. Create complete stories without asking for additional input.',
      stream: true,
      responseSchema: storySchema,
      requiresHumanInput: false,
      parameters: {
        temperature: 0.85,
        top_p: 0.9,
        max_tokens: 1000,
        presence_penalty: 0.2,
        frequency_penalty: 0.1
      }
    });

    // Execute with both streaming and schema
    const result = await streamingStructuredKata.execute('Create a science fiction story about AI and humans working together');
    
    // Log summary
    this.logger.info(`📊 Streaming Structured Summary:`);
    this.logger.info(`   Total Cost: $${streamingStructuredKata.getTotalEstimatedCost().toFixed(6)}`);
    const totalTokens = streamingStructuredKata.getTotalTokenUsage();
    this.logger.info(`   Total Tokens: ${totalTokens.total_tokens}`);
  }

  /**
   * FEATURE 5: Shinobi Multi-Kata Orchestration
   * Demonstrates how to use the Shinobi class to orchestrate multiple katas with a persona
   */
  async demonstrateShinobi(userQuery: string): Promise<void> {
    this.logger.info('🥷 Starting Shinobi Multi-Kata Orchestration Demo');

    // Create runtime for dependency injection
    const runtime = new KataRuntime(this.openai, this.logger, this.memory);

    // Create shared shurikens that will be available to all katas
    const weatherSchema = z.object({
      city: z.string().describe('The city name to get weather for'),
      unit: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature unit preference')
    });
    const weatherShuriken = new Shuriken(
      'get_weather', 
      'Get current weather information for a specific city', 
      weatherSchema,
      (params: any) => this.getWeather(params.city, params.unit || 'celsius')
    );

    const calculatorSchema = z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The mathematical operation to perform'),
      a: z.number().describe('First number'),
      b: z.number().describe('Second number')
    });
    const calculatorShuriken = new Shuriken(
      'calculate', 
      'Perform basic mathematical calculations', 
      calculatorSchema,
      (params: any) => this.calculate(params.operation, params.a, params.b)
    );

    // Create a Shinobi with a specific persona and multiple katas
    const travelAssistantShinobi = new Shinobi(runtime, {
      role: 'Expert Travel Assistant',
      description: 'A knowledgeable and helpful travel expert who provides comprehensive travel advice, weather information, and cost calculations.',
      backstory: 'You have been working in the travel industry for over 15 years, helping thousands of travelers plan their perfect trips. You have extensive knowledge of destinations worldwide, weather patterns, and travel costs. You always provide practical, actionable advice with a friendly and professional demeanor.',
      shurikens: [weatherShuriken, calculatorShuriken], // Shared across all katas
      katas: [
        {
          model: 'gpt-4o-mini',
          title: 'Weather Analysis Specialist',
          description: 'Analyze weather conditions and provide travel recommendations based on weather data. Focus on providing comprehensive weather insights for travel planning.',
          parameters: {
            temperature: 0.7,
            max_tokens: 800
          }
        },
        {
          model: 'gpt-4o-mini',
          title: 'Travel Cost Calculator',
          description: 'Calculate travel costs, budgets, and provide financial advice for trips. Provide detailed cost breakdowns and budget recommendations.',
          parameters: {
            temperature: 0.5,
            max_tokens: 600
          }
        },
        {
          model: 'gpt-4o-mini',
          title: 'Destination Recommender',
          description: 'Provide destination recommendations and travel tips based on user preferences. Offer comprehensive travel advice and local insights.',
          parameters: {
            temperature: 0.8,
            max_tokens: 1000
          }
        }
      ]
    });

    // Execute the Shinobi workflow
    const result = await travelAssistantShinobi.execute(userQuery);
    
    // Log detailed summary
    this.logger.info(`📊 Shinobi Execution Summary:`);
    this.logger.info(`   Persona: ${travelAssistantShinobi.getConfig().role}`);
    this.logger.info(`   Katas Executed: ${result.result.kataResults.length}`);
    this.logger.info(`   Total Cost: $${result.result.aggregatedBilling.estimatedCost.toFixed(6)}`);
    this.logger.info(`   Total Tokens: ${result.result.aggregatedBilling.tokenUsage.total_tokens}`);
    this.logger.info(`   Total Execution Time: ${result.result.totalExecutionTime}ms`);
  }

  /**
   * Run all examples in sequence
   */
  async runAllExamples(): Promise<void> {
    this.logger.info('🚀 Running All OpenAI Examples');
    
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 1: SHURIKEN CALLING');
    console.log('='.repeat(60));
    await this.demonstrateShurikenCalling('What\'s the weather like in Tokyo and what\'s 15 + 27?');
    
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 2: CONTENT STREAMING');
    console.log('='.repeat(60));
    await this.demonstrateStreaming('Write a short story about a robot learning to paint');
    
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 3: STRUCTURED OUTPUT');
    console.log('='.repeat(60));
    await this.demonstrateStructuredOutput();
    
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 4: STREAMING STRUCTURED OUTPUT');
    console.log('='.repeat(60));
    await this.demonstrateStreamingStructuredOutput();
    
    console.log('\n' + '='.repeat(60));
    console.log('EXAMPLE 5: SHINOBI MULTI-KATA ORCHESTRATION');
    console.log('='.repeat(60));
    await this.demonstrateShinobi('I want to plan a trip to Paris in December. What\'s the weather like and what would be the cost for a 5-day trip for 2 people?');
    
    this.logger.info('🎉 All examples completed!');
  }
}