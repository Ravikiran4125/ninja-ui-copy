/**
 * Scoped memory management for ThoughtSystem.
 * Provides isolated memory contexts for different reasoning workflows.
 */
export class ThoughtMemory {
  private memory: Map<string, Record<string, any>> = new Map();

  /**
   * Read from memory scope
   */
  read(scope: string): Record<string, any> {
    return this.memory.get(scope) || {};
  }

  /**
   * Write to memory scope
   */
  write(scope: string, key: string, value: any): void {
    if (!this.memory.has(scope)) {
      this.memory.set(scope, {});
    }
    
    const scopeMemory = this.memory.get(scope)!;
    scopeMemory[key] = value;
  }

  /**
   * Update entire scope
   */
  updateScope(scope: string, data: Record<string, any>): void {
    const existing = this.memory.get(scope) || {};
    this.memory.set(scope, { ...existing, ...data });
  }

  /**
   * Check if key exists in scope
   */
  has(scope: string, key: string): boolean {
    const scopeMemory = this.memory.get(scope);
    return scopeMemory ? key in scopeMemory : false;
  }

  /**
   * Delete key from scope
   */
  delete(scope: string, key: string): boolean {
    const scopeMemory = this.memory.get(scope);
    if (scopeMemory && key in scopeMemory) {
      delete scopeMemory[key];
      return true;
    }
    return false;
  }

  /**
   * Clear scope
   */
  clear(scope: string): void {
    this.memory.delete(scope);
  }

  /**
   * Clear all memory
   */
  clearAll(): void {
    this.memory.clear();
  }

  /**
   * Get all scope names
   */
  getScopes(): string[] {
    return Array.from(this.memory.keys());
  }

  /**
   * Get memory size for scope
   */
  getSize(scope: string): number {
    const scopeMemory = this.memory.get(scope);
    return scopeMemory ? Object.keys(scopeMemory).length : 0;
  }

  /**
   * Export memory for debugging
   */
  export(): Record<string, Record<string, any>> {
    const exported: Record<string, Record<string, any>> = {};
    for (const [scope, data] of this.memory) {
      exported[scope] = { ...data };
    }
    return exported;
  }

  /**
   * Import memory state
   */
  import(data: Record<string, Record<string, any>>): void {
    this.memory.clear();
    for (const [scope, scopeData] of Object.entries(data)) {
      this.memory.set(scope, { ...scopeData });
    }
  }
}