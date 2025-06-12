import OpenAI from 'openai';
import { Logger } from '../utils/Logger.js';
import { Memory } from './memory.js';

/**
 * Dependency injection container for the AI crew orchestration system.
 * KataRuntime provides centralized access to core services (OpenAI client, logger, memory)
 * and ensures consistent configuration across all components.
 * 
 * @example
 * ```typescript
 * const runtime = new KataRuntime(openai, logger, memory);
 * 
 * // Use runtime to create components
 * const kata = new Kata(runtime, kataConfig);
 * const shinobi = new Shinobi(runtime, shinobiConfig);
 * ```
 */
export class KataRuntime {
  private _openai: OpenAI;
  private _logger: Logger;
  private _memory?: Memory;

  /**
   * Creates a new KataRuntime instance.
   * 
   * @param openai Configured OpenAI client instance
   * @param logger Base logger instance for the application
   * @param memory Optional Memory instance for persistence and analytics
   */
  constructor(openai: OpenAI, logger: Logger, memory?: Memory) {
    this._openai = openai;
    this._logger = logger;
    this._memory = memory;
  }

  /**
   * Get the OpenAI client instance.
   * 
   * @returns The configured OpenAI client
   */
  get openai(): OpenAI {
    return this._openai;
  }

  /**
   * Get the base logger instance.
   * 
   * @returns The base logger
   */
  get logger(): Logger {
    return this._logger;
  }

  /**
   * Get the memory instance.
   * 
   * @returns The Memory instance or undefined if not configured
   */
  get memory(): Memory | undefined {
    return this._memory;
  }

  /**
   * Create a contextual logger for a specific Kata.
   * The logger will include the Kata's context in all log messages.
   * 
   * @param kataTitle The title/name of the Kata
   * @returns A new Logger instance with Kata context
   */
  createKataLogger(kataTitle: string): Logger {
    return this._logger.createContextualLogger(kataTitle, this._memory);
  }

  /**
   * Create a contextual logger with specific IDs for tracking.
   * This enables detailed tracking of execution across the crew hierarchy.
   * 
   * @param context The context name for this logger
   * @param ids Object containing shinobi_id, kata_id, and/or shuriken_id for tracking
   * @returns A new Logger instance with tracking IDs
   * 
   * @example
   * ```typescript
   * const logger = runtime.createTrackedLogger('WeatherAnalyst', {
   *   shinobi_id: 'shinobi-uuid',
   *   kata_id: 'kata-uuid'
   * });
   * ```
   */
  createTrackedLogger(context: string, ids: {
    shinobi_id?: string;
    kata_id?: string;
    shuriken_id?: string;
  }): Logger {
    return this._logger.createTrackedLogger(context, ids, this._memory);
  }
}