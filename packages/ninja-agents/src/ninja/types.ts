import type { Shuriken } from '../core/shuriken.js';
import type { ThoughtModuleConfig } from '../thought/types.js';

/**
 * Enhanced Shinobi configuration with ThoughtSystem integration
 */
export interface ShinobiConfig {
  role: string;
  description: string;
  backstory: string;
  katas: KataConfig[];
  shurikens?: Shuriken[];
  thoughtModules?: ThoughtModuleConfig[];
}

/**
 * Enhanced Kata configuration with ThoughtSystem integration
 */
export interface KataConfig {
  model: string;
  title: string;
  description: string;
  shurikens?: Shuriken[];
  thoughtModule?: ThoughtModuleConfig;
  stream?: boolean;
  responseSchema?: any;
  parameters?: any;
  shinobiPersona?: any;
  requiresHumanInput?: boolean;
}

/**
 * Clan configuration for agent networks
 */
export interface ClanConfig {
  name: string;
  description?: string;
  shinobi: ShinobiConfig[];
  strategy: ClanStrategy;
  maxConcurrency?: number;
  timeout?: number;
}

/**
 * Clan execution strategies
 */
export type ClanStrategy = 
  | 'sequential'     // Execute shinobi one after another
  | 'parallel'       // Execute all shinobi simultaneously
  | 'competitive'    // Execute all, return first successful result
  | 'collaborative'  // Execute all, synthesize results
  | 'conditional';   // Execute based on conditions

/**
 * Dojo configuration for workflows
 */
export interface DojoConfig {
  name: string;
  description?: string;
  steps: DojoStep[];
  errorHandling?: 'stop' | 'continue' | 'retry';
  maxRetries?: number;
}

/**
 * Dojo workflow step
 */
export interface DojoStep {
  id: string;
  type: 'shinobi' | 'kata' | 'clan' | 'condition' | 'parallel';
  config: any;
  condition?: (context: any) => boolean;
  onError?: 'stop' | 'continue' | 'retry';
}