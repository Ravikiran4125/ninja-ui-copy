import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import { randomUUID } from 'crypto';

/**
 * Represents a single log entry in the system.
 * Contains all information about an event, execution, or operation.
 */
export interface LogEntry {
  /** Unique identifier for this log entry */
  id: string;
  /** When this log entry was created */
  timestamp: Date;
  /** Severity level of the log entry */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** The main log message */
  message: string;
  /** Optional context information (e.g., kata name, shinobi role) */
  context?: string;
  /** ID of the Shinobi if this log is related to Shinobi execution */
  shinobi_id?: string;
  /** ID of the Kata if this log is related to Kata execution */
  kata_id?: string;
  /** ID of the Shuriken if this log is related to Shuriken execution */
  shuriken_id?: string;
  /** Execution time in milliseconds for performance tracking */
  execution_time?: number;
  /** Token usage information for cost tracking */
  token_usage?: any;
  /** Estimated cost in USD for billing tracking */
  estimated_cost?: number;
  /** File path for file-based logging operations */
  file_path?: string;
  /** Additional structured metadata */
  metadata?: Record<string, any>;
}

/**
 * Configuration options for Memory instance.
 * Controls how and where logs are stored.
 */
export interface MemoryConfig {
  /** Supabase project URL for database logging */
  supabaseUrl?: string;
  /** Supabase anonymous key for database access */
  supabaseKey?: string;
  /** Default file path for file-based logging */
  defaultFilePath?: string;
  /** Whether to enable database logging via Supabase */
  enableDatabaseLogging?: boolean;
  /** Whether to enable file-based logging */
  enableFileLogging?: boolean;
}

/**
 * Persistent storage and logging system for the AI crew orchestration framework.
 * Provides both database (Supabase) and file-based logging capabilities with
 * comprehensive analytics and querying features.
 * 
 * @example
 * ```typescript
 * const memory = new Memory({
 *   supabaseUrl: process.env.SUPABASE_URL,
 *   supabaseKey: process.env.SUPABASE_ANON_KEY,
 *   enableDatabaseLogging: true,
 *   enableFileLogging: false
 * });
 * 
 * // Log an event
 * await memory.log({
 *   level: 'info',
 *   message: 'Kata execution started',
 *   context: 'WeatherAnalyst',
 *   kata_id: 'kata-uuid',
 *   metadata: { user_query: 'What is the weather in Paris?' }
 * });
 * 
 * // Query logs
 * const recentLogs = await memory.queryLogs({ limit: 10 });
 * 
 * // Get execution statistics
 * const stats = await memory.getExecutionStats();
 * ```
 */
export class Memory {
  private supabase?: SupabaseClient;
  private config: MemoryConfig;
  private defaultFilePath?: string;

  /**
   * Creates a new Memory instance.
   * 
   * @param config Configuration options for logging destinations and behavior
   */
  constructor(config: MemoryConfig = {}) {
    this.config = {
      enableDatabaseLogging: true,
      enableFileLogging: false,
      ...config
    };

    // Initialize Supabase client if credentials are provided
    if (config.supabaseUrl && config.supabaseKey && config.enableDatabaseLogging) {
      this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    }

    this.defaultFilePath = config.defaultFilePath;
  }

  /**
   * Generate a unique ID for tracking.
   * 
   * @returns A new UUID string
   */
  generateId(): string {
    return randomUUID();
  }

  /**
   * Log entry to database (Supabase).
   * 
   * @param logEntry The log entry to store in the database
   * @private
   */
  async logToDatabase(logEntry: LogEntry): Promise<void> {
    if (!this.supabase || !this.config.enableDatabaseLogging) {
      return;
    }

    try {
      const { error } = await this.supabase
        .from('logs')
        .insert({
          id: logEntry.id,
          timestamp: logEntry.timestamp.toISOString(),
          level: logEntry.level,
          message: logEntry.message,
          context: logEntry.context,
          shinobi_id: logEntry.shinobi_id,
          kata_id: logEntry.kata_id,
          shuriken_id: logEntry.shuriken_id,
          execution_time: logEntry.execution_time,
          token_usage: logEntry.token_usage,
          estimated_cost: logEntry.estimated_cost,
          file_path: logEntry.file_path,
          metadata: logEntry.metadata
        });

      if (error) {
        console.error('Failed to log to database:', error);
      }
    } catch (error) {
      console.error('Database logging error:', error);
    }
  }

  /**
   * Log entry to file.
   * 
   * @param filePath The file path to write to
   * @param logEntry The log entry to write
   * @private
   */
  async logToFile(filePath: string, logEntry: LogEntry): Promise<void> {
    if (!this.config.enableFileLogging) {
      return;
    }

    try {
      // Ensure directory exists
      await fs.mkdir(dirname(filePath), { recursive: true });

      // Format log entry as JSON line
      const logLine = JSON.stringify({
        ...logEntry,
        timestamp: logEntry.timestamp.toISOString()
      }) + '\n';

      // Append to file
      await fs.appendFile(filePath, logLine, 'utf8');
    } catch (error) {
      console.error(`Failed to log to file ${filePath}:`, error);
    }
  }

  /**
   * Log entry using configured destinations.
   * This is the main logging method that handles routing to database and/or file.
   * 
   * @param logEntry The log entry data (without id and timestamp)
   * @returns Promise resolving to the generated log entry ID
   * 
   * @example
   * ```typescript
   * const logId = await memory.log({
   *   level: 'info',
   *   message: 'Shinobi execution completed',
   *   context: 'TravelExpert',
   *   shinobi_id: 'shinobi-uuid',
   *   execution_time: 2500,
   *   estimated_cost: 0.001234,
   *   metadata: {
   *     katas_executed: 3,
   *     total_tokens: 1500
   *   }
   * });
   * ```
   */
  async log(logEntry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string> {
    const id = this.generateId();
    const timestamp = new Date();
    
    const fullLogEntry: LogEntry = {
      id,
      timestamp,
      ...logEntry
    };

    // Log to database if enabled
    if (this.config.enableDatabaseLogging) {
      await this.logToDatabase(fullLogEntry);
    }

    // Log to file if path is specified or default is set
    const filePath = logEntry.file_path || this.defaultFilePath;
    if (filePath && this.config.enableFileLogging) {
      await this.logToFile(filePath, fullLogEntry);
    }

    return id;
  }

  /**
   * Query logs from database with filtering options.
   * 
   * @param filters Object containing filter criteria
   * @returns Promise resolving to array of matching log entries
   * 
   * @example
   * ```typescript
   * // Get recent errors
   * const errors = await memory.queryLogs({
   *   level: 'error',
   *   limit: 5
   * });
   * 
   * // Get logs for specific Shinobi
   * const shinobiLogs = await memory.queryLogs({
   *   shinobi_id: 'shinobi-uuid',
   *   start_time: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
   * });
   * ```
   */
  async queryLogs(filters: {
    shinobi_id?: string;
    kata_id?: string;
    shuriken_id?: string;
    level?: string;
    start_time?: Date;
    end_time?: Date;
    limit?: number;
  } = {}): Promise<LogEntry[]> {
    if (!this.supabase) {
      return [];
    }

    try {
      let query = this.supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.shinobi_id) {
        query = query.eq('shinobi_id', filters.shinobi_id);
      }
      if (filters.kata_id) {
        query = query.eq('kata_id', filters.kata_id);
      }
      if (filters.shuriken_id) {
        query = query.eq('shuriken_id', filters.shuriken_id);
      }
      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      if (filters.start_time) {
        query = query.gte('timestamp', filters.start_time.toISOString());
      }
      if (filters.end_time) {
        query = query.lte('timestamp', filters.end_time.toISOString());
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to query logs:', error);
        return [];
      }

      return (data || []).map(row => ({
        ...row,
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      console.error('Query logs error:', error);
      return [];
    }
  }

  /**
   * Get execution statistics and analytics.
   * 
   * @param filters Optional filters to scope the statistics
   * @returns Promise resolving to aggregated statistics
   * 
   * @example
   * ```typescript
   * // Get overall statistics
   * const stats = await memory.getExecutionStats();
   * console.log(`Total executions: ${stats.total_executions}`);
   * console.log(`Total cost: $${stats.total_cost.toFixed(6)}`);
   * 
   * // Get statistics for specific Shinobi
   * const shinobiStats = await memory.getExecutionStats({
   *   shinobi_id: 'shinobi-uuid'
   * });
   * ```
   */
  async getExecutionStats(filters: {
    shinobi_id?: string;
    kata_id?: string;
    start_time?: Date;
    end_time?: Date;
  } = {}): Promise<{
    total_executions: number;
    total_cost: number;
    total_tokens: number;
    avg_execution_time: number;
  }> {
    if (!this.supabase) {
      return {
        total_executions: 0,
        total_cost: 0,
        total_tokens: 0,
        avg_execution_time: 0
      };
    }

    try {
      let query = this.supabase
        .from('logs')
        .select('execution_time, estimated_cost, token_usage')
        .not('execution_time', 'is', null);

      if (filters.shinobi_id) {
        query = query.eq('shinobi_id', filters.shinobi_id);
      }
      if (filters.kata_id) {
        query = query.eq('kata_id', filters.kata_id);
      }
      if (filters.start_time) {
        query = query.gte('timestamp', filters.start_time.toISOString());
      }
      if (filters.end_time) {
        query = query.lte('timestamp', filters.end_time.toISOString());
      }

      const { data, error } = await query;

      if (error || !data) {
        return {
          total_executions: 0,
          total_cost: 0,
          total_tokens: 0,
          avg_execution_time: 0
        };
      }

      const stats = data.reduce(
        (acc, row) => {
          acc.total_executions += 1;
          acc.total_cost += row.estimated_cost || 0;
          acc.total_tokens += row.token_usage?.total_tokens || 0;
          acc.total_execution_time += row.execution_time || 0;
          return acc;
        },
        {
          total_executions: 0,
          total_cost: 0,
          total_tokens: 0,
          total_execution_time: 0
        }
      );

      return {
        total_executions: stats.total_executions,
        total_cost: stats.total_cost,
        total_tokens: stats.total_tokens,
        avg_execution_time: stats.total_executions > 0 
          ? stats.total_execution_time / stats.total_executions 
          : 0
      };
    } catch (error) {
      console.error('Get execution stats error:', error);
      return {
        total_executions: 0,
        total_cost: 0,
        total_tokens: 0,
        avg_execution_time: 0
      };
    }
  }

  /**
   * Check if database logging is available and enabled.
   * 
   * @returns True if database logging is configured and enabled
   */
  isDatabaseLoggingEnabled(): boolean {
    return !!this.supabase && !!this.config.enableDatabaseLogging;
  }

  /**
   * Check if file logging is enabled.
   * 
   * @returns True if file logging is enabled
   */
  isFileLoggingEnabled(): boolean {
    return !!this.config.enableFileLogging;
  }

  /**
   * Update configuration at runtime.
   * 
   * @param updates Partial configuration updates to apply
   */
  updateConfig(updates: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Reinitialize Supabase if needed
    if (updates.supabaseUrl || updates.supabaseKey) {
      if (this.config.supabaseUrl && this.config.supabaseKey && this.config.enableDatabaseLogging) {
        this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);
      }
    }
  }
}