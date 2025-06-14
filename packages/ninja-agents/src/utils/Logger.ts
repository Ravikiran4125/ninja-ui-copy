import chalk from 'chalk';
import { Memory } from '../core/memory.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private level: LogLevel;
  private context?: string;
  private memory?: Memory;
  private trackingIds: {
    shinobi_id?: string;
    kata_id?: string;
    shuriken_id?: string;
  } = {};
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(level: LogLevel = 'info', context?: string, memory?: Memory) {
    this.level = level;
    this.context = context;
    this.memory = memory;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const levelColors = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red
    };

    const coloredLevel = levelColors[level](`[${level.toUpperCase()}]`);
    const coloredTimestamp = chalk.gray(timestamp);
    const contextPrefix = this.context ? chalk.cyan(`[${this.context}] `) : '';
    
    return `${coloredTimestamp} ${coloredLevel} ${contextPrefix}${message}`;
  }

  private async logToMemory(level: LogLevel, message: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.memory) return;

    try {
      await this.memory.log({
        level,
        message,
        context: this.context,
        shinobi_id: this.trackingIds.shinobi_id,
        kata_id: this.trackingIds.kata_id,
        shuriken_id: this.trackingIds.shuriken_id,
        metadata
      });
    } catch (error) {
      console.error('Failed to log to memory:', error);
    }
  }

  debug(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args);
      this.logToMemory('debug', message, metadata);
    }
  }

  info(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), ...args);
      this.logToMemory('info', message, metadata);
    }
  }

  warn(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
      this.logToMemory('warn', message, metadata);
    }
  }

  error(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
      this.logToMemory('error', message, metadata);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Set tracking IDs for this logger instance
   */
  setTrackingIds(ids: {
    shinobi_id?: string;
    kata_id?: string;
    shuriken_id?: string;
  }): void {
    this.trackingIds = { ...this.trackingIds, ...ids };
  }

  /**
   * Create a new logger instance with a specific context
   */
  createContextualLogger(context: string, memory?: Memory): Logger {
    const logger = new Logger(this.level, context, memory || this.memory);
    logger.trackingIds = { ...this.trackingIds };
    return logger;
  }

  /**
   * Create a new logger instance with specific tracking IDs
   */
  createTrackedLogger(context: string, ids: {
    shinobi_id?: string;
    kata_id?: string;
    shuriken_id?: string;
  }, memory?: Memory): Logger {
    const logger = new Logger(this.level, context, memory || this.memory);
    logger.trackingIds = { ...this.trackingIds, ...ids };
    return logger;
  }

  /**
   * Log the start of a Kata execution
   */
  async kataStart(title: string, userQuery: string, kataId?: string): Promise<void> {
    if (kataId) {
      this.setTrackingIds({ kata_id: kataId });
    }
    
    const message = `🥋 Kata Started: ${title}`;
    this.info(message, {
      kata_title: title,
      user_query: userQuery,
      event_type: 'kata_start'
    });
    
    this.info(`📝 User Query: "${userQuery}"`);
  }

  /**
   * Log the end of a Kata execution
   */
  async kataEnd(title: string, status: 'success' | 'failure', executionTime?: number, tokenUsage?: any, estimatedCost?: number): Promise<void> {
    const emoji = status === 'success' ? '✅' : '❌';
    const message = `${emoji} Kata Completed: ${title} (${status})`;
    
    this.info(message, {
      kata_title: title,
      status,
      execution_time: executionTime,
      token_usage: tokenUsage,
      estimated_cost: estimatedCost,
      event_type: 'kata_end'
    });
  }

  /**
   * Log when a Shuriken is called by the AI
   */
  async shurikenCall(name: string, args: string, shurikenId?: string): Promise<void> {
    if (shurikenId) {
      this.setTrackingIds({ shuriken_id: shurikenId });
    }
    
    const message = `🗡️ Shuriken Called: ${name}(${args})`;
    this.info(message, {
      shuriken_name: name,
      shuriken_args: args,
      event_type: 'shuriken_call'
    });
  }

  /**
   * Log the result of a Shuriken execution
   */
  async shurikenResult(name: string, result: any, executionTime?: number): Promise<void> {
    const message = `🎯 Shuriken Result: ${name}`;
    this.debug(message, {
      shuriken_name: name,
      shuriken_result: result,
      execution_time: executionTime,
      event_type: 'shuriken_result'
    });
  }

  /**
   * Log errors during Shuriken execution
   */
  async shurikenError(name: string, error: any): Promise<void> {
    const message = `💥 Shuriken Error: ${name} -> ${error instanceof Error ? error.message : 'Unknown error'}`;
    this.error(message, {
      shuriken_name: name,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      error_stack: error instanceof Error ? error.stack : undefined,
      event_type: 'shuriken_error'
    });
  }

  /**
   * Log Shinobi execution start
   */
  async shinobiStart(role: string, userQuery: string, shinobiId?: string): Promise<void> {
    if (shinobiId) {
      this.setTrackingIds({ shinobi_id: shinobiId });
    }
    
    const message = `🥷 Shinobi "${role}" starting execution`;
    this.info(message, {
      shinobi_role: role,
      user_query: userQuery,
      event_type: 'shinobi_start'
    });
  }

  /**
   * Log Shinobi execution end
   */
  async shinobiEnd(role: string, status: 'success' | 'failure', executionTime?: number, totalCost?: number, totalTokens?: number): Promise<void> {
    const emoji = status === 'success' ? '🎉' : '❌';
    const message = `${emoji} Shinobi "${role}" execution completed (${status})`;
    
    this.info(message, {
      shinobi_role: role,
      status,
      execution_time: executionTime,
      total_cost: totalCost,
      total_tokens: totalTokens,
      event_type: 'shinobi_end'
    });
  }

  /**
   * Log token usage information
   */
  tokenUsage(tokens: { prompt: number; completion: number; total: number }): void {
    this.info(`🔢 Token Usage: ${tokens.total} total (${tokens.prompt} prompt + ${tokens.completion} completion)`, {
      token_usage: tokens,
      event_type: 'token_usage'
    });
  }

  /**
   * Log billing information
   */
  billing(cost: string, model: string): void {
    this.info(`💰 Estimated Cost: ${cost} (${model})`, {
      estimated_cost: cost,
      model,
      event_type: 'billing'
    });
  }

  /**
   * Log execution timing
   */
  timing(operation: string, duration: number): void {
    this.info(`⏱️ ${operation}: ${duration}ms`, {
      operation,
      duration,
      event_type: 'timing'
    });
  }
}