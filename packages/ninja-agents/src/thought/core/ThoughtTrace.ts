import type { ExecutionTrace } from '../types.js';

/**
 * Execution logging and debugging for ThoughtSystem.
 * Captures detailed execution traces for analysis and replay.
 */
export class ThoughtTrace {
  private traces: ExecutionTrace[] = [];
  private maxTraces: number = 1000;

  /**
   * Add execution trace
   */
  addTrace(trace: ExecutionTrace): void {
    this.traces.push(trace);
    
    // Maintain max traces limit
    if (this.traces.length > this.maxTraces) {
      this.traces.shift();
    }
  }

  /**
   * Get all traces
   */
  getTrace(): ExecutionTrace[] {
    return [...this.traces];
  }

  /**
   * Get traces by module
   */
  getTracesByModule(moduleId: string): ExecutionTrace[] {
    return this.traces.filter(trace => trace.moduleId === moduleId);
  }

  /**
   * Get traces by time range
   */
  getTracesByTimeRange(start: Date, end: Date): ExecutionTrace[] {
    return this.traces.filter(trace => 
      trace.timestamp >= start && trace.timestamp <= end
    );
  }

  /**
   * Get error traces
   */
  getErrorTraces(): ExecutionTrace[] {
    return this.traces.filter(trace => trace.error);
  }

  /**
   * Get execution statistics
   */
  getStats() {
    const totalTraces = this.traces.length;
    const errorCount = this.getErrorTraces().length;
    const avgExecutionTime = totalTraces > 0 
      ? this.traces.reduce((sum, trace) => sum + trace.executionTime, 0) / totalTraces 
      : 0;

    const moduleStats = new Map<string, number>();
    this.traces.forEach(trace => {
      const count = moduleStats.get(trace.moduleId) || 0;
      moduleStats.set(trace.moduleId, count + 1);
    });

    return {
      totalTraces,
      errorCount,
      successRate: totalTraces > 0 ? ((totalTraces - errorCount) / totalTraces) * 100 : 0,
      avgExecutionTime,
      moduleStats: Object.fromEntries(moduleStats)
    };
  }

  /**
   * Clear all traces
   */
  clear(): void {
    this.traces = [];
  }

  /**
   * Export traces for analysis
   */
  export(): ExecutionTrace[] {
    return this.getTrace();
  }

  /**
   * Import traces
   */
  import(traces: ExecutionTrace[]): void {
    this.traces = [...traces];
  }

  /**
   * Set max traces limit
   */
  setMaxTraces(max: number): void {
    this.maxTraces = max;
    
    // Trim if necessary
    if (this.traces.length > max) {
      this.traces = this.traces.slice(-max);
    }
  }
}