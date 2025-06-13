import type { ThoughtNode, ThoughtEdge, ThoughtContext, ThoughtResult } from '../types.js';
import { ThoughtModule } from './ThoughtModule.js';

/**
 * Directed Acyclic Graph (DAG) for complex reasoning workflows.
 * Enables sophisticated cognitive flows with conditional branching and parallel execution.
 */
export class ThoughtGraph {
  private nodes: Map<string, ThoughtNode> = new Map();
  private edges: ThoughtEdge[] = [];
  private modules: Map<string, ThoughtModule> = new Map();

  /**
   * Add a node to the graph
   */
  addNode(node: ThoughtNode, module: ThoughtModule): void {
    this.nodes.set(node.id, node);
    this.modules.set(node.id, module);
  }

  /**
   * Connect two nodes with an edge
   */
  connect(from: string, to: string, condition?: (context: ThoughtContext) => boolean): void {
    this.edges.push({ from, to, condition });
  }

  /**
   * Execute the graph with topological ordering
   */
  async execute(initialContext: ThoughtContext): Promise<ThoughtResult[]> {
    const results: ThoughtResult[] = [];
    const executed = new Set<string>();
    const context = { ...initialContext };

    // Get execution order using topological sort
    const executionOrder = this.topologicalSort();

    for (const nodeId of executionOrder) {
      const node = this.nodes.get(nodeId);
      const module = this.modules.get(nodeId);

      if (!node || !module) continue;

      // Check if all dependencies are satisfied
      const dependenciesMet = node.dependencies.every(dep => executed.has(dep));
      if (!dependenciesMet) continue;

      // Check node condition if exists
      if (node.condition && !node.condition(context)) continue;

      // Execute the module
      const result = await module.think(context);
      results.push(result);
      executed.add(nodeId);

      // Update context with result
      context.memory[nodeId] = result.output;
      context.trace.push(result.trace);
    }

    return results;
  }

  /**
   * Topological sort for execution ordering
   */
  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error('Circular dependency detected in ThoughtGraph');
      }
      if (visited.has(nodeId)) return;

      temp.add(nodeId);

      // Visit dependencies first
      const node = this.nodes.get(nodeId);
      if (node) {
        node.dependencies.forEach(dep => visit(dep));
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      result.push(nodeId);
    };

    // Visit all nodes
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }

    return result;
  }

  /**
   * Validate the graph structure
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for missing dependencies
    for (const [nodeId, node] of this.nodes) {
      for (const dep of node.dependencies) {
        if (!this.nodes.has(dep)) {
          errors.push(`Node ${nodeId} depends on missing node ${dep}`);
        }
      }
    }

    // Check for circular dependencies
    try {
      this.topologicalSort();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Circular dependency detected');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.length,
      complexity: this.calculateComplexity()
    };
  }

  /**
   * Calculate graph complexity
   */
  private calculateComplexity(): 'low' | 'medium' | 'high' {
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.length;
    
    if (nodeCount <= 3 && edgeCount <= 3) return 'low';
    if (nodeCount <= 10 && edgeCount <= 15) return 'medium';
    return 'high';
  }
}