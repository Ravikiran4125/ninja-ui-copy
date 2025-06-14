import type {
  ScrollConfig,
  ScrollResponse,
  ScrollStreamResponse,
  GenerateTextOptions,
  GenerateObjectOptions,
  StreamTextOptions,
  StreamObjectOptions
} from '../types.js';

/**
 * Abstract base class for LLM provider implementations.
 * Provides a unified interface for different LLM providers.
 */
export abstract class Scroll {
  protected config: ScrollConfig;

  constructor(config: ScrollConfig) {
    this.config = config;
  }

  /**
   * Generate text response
   */
  abstract generateText(options: GenerateTextOptions): Promise<ScrollResponse<string>>;

  /**
   * Generate structured object response
   */
  abstract generateObject<T>(options: GenerateObjectOptions): Promise<ScrollResponse<T>>;

  /**
   * Stream text response
   */
  abstract streamText(options: StreamTextOptions): Promise<ScrollStreamResponse<string>>;

  /**
   * Stream structured object response
   */
  abstract streamObject<T>(options: StreamObjectOptions): Promise<ScrollStreamResponse<T>>;

  /**
   * Get provider information
   */
  getInfo() {
    return {
      provider: this.getProviderName(),
      model: this.config.model,
      config: this.config
    };
  }

  /**
   * Get provider name
   */
  abstract getProviderName(): string;

  /**
   * Test connection to provider
   */
  abstract testConnection(): Promise<boolean>;
}