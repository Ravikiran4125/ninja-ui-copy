/**
 * @fileoverview Ninja Agents SDK - Main package exports
 * 
 * A comprehensive TypeScript framework for building sophisticated AI crew orchestration systems.
 * This package provides a clean, modular architecture for creating AI agents that can work 
 * together to solve complex problems.
 * 
 * @example Quick Start
 * ```typescript
 * import { Shinobi, Kata, Shuriken, KataRuntime, Logger, Memory } from 'ninja-agents';
 * import { z } from 'zod';
 * import OpenAI from 'openai';
 * 
 * // Initialize core services
 * const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 * const memory = new Memory();
 * const logger = new Logger('info', 'MyApp', memory);
 * const runtime = new KataRuntime(openai, logger, memory);
 * 
 * // Create a simple capability
 * const calculatorShuriken = new Shuriken(
 *   'calculate',
 *   'Perform mathematical calculations',
 *   z.object({
 *     operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
 *     a: z.number(),
 *     b: z.number()
 *   }),
 *   (params) => {
 *     switch (params.operation) {
 *       case 'add': return params.a + params.b;
 *       case 'subtract': return params.a - params.b;
 *       case 'multiply': return params.a * params.b;
 *       case 'divide': return params.a / params.b;
 *     }
 *   }
 * );
 * 
 * // Create and execute a Shinobi
 * const mathExpert = new Shinobi(runtime, {
 *   role: 'Mathematics Expert',
 *   description: 'A skilled mathematician',
 *   backstory: 'PhD in Mathematics with 20 years of experience',
 *   shurikens: [calculatorShuriken],
 *   katas: [{
 *     model: 'gpt-4o-mini',
 *     title: 'Problem Solver',
 *     description: 'Solve mathematical problems step by step'
 *   }]
 * });
 * 
 * const result = await mathExpert.execute('What is 15% of 240, then multiply by 3?');
 * ```
 * 
 * @packageDocumentation
 * @version 1.0.0
 * @author Ninja Agents Team
 * @since 1.0.0
 */

// Main package exports - Dual-layer architecture


/**
 * @group Ninja Layer
 * @category User-Facing API
 * 
 * 🥷 NINJA LAYER (User-Facing API)
 * Enhanced components with advanced reasoning capabilities
 */
export { 
  Shinobi, 
  Kata, 
  Shuriken, 
  Clan, 
  Dojo 
} from './ninja/index';

/**
 * @group Thought System
 * @category Internal Reasoning Engine
 * 
 * 🧠 THOUGHT SYSTEM (Internal Reasoning Engine)
 * Advanced reasoning modules for sophisticated cognitive workflows
 */
export {
  ThoughtModule,
  ThoughtRuntime,
  ThoughtGraph,
  ThoughtMemory,
  ThoughtTrace,
  PromptTemplate,
  PromptStrategy,
  PromptExecutor
} from './thought/index';

/**
 * @group Scroll Layer
 * @category LLM Provider Abstraction
 * 
 * 📜 SCROLL LAYER (LLM Provider Abstraction)
 * Unified interface for different LLM providers
 */
export {
  Scroll,
  OpenAIScroll
} from './scroll/index';

/**
 * @group Core Utilities
 * @category Runtime & Infrastructure
 * 
 * 🛠️ CORE UTILITIES (Existing)
 * Essential runtime components and utilities
 */
export {
  KataRuntime,
  Memory,
} from './core/index.js';

/**
 * @group Core Utilities
 * @category Logging
 * 
 * Structured logging system with multiple levels and memory integration
 */
export {
  Logger
} from './utils/Logger.js'

/**
 * @group Type Definitions
 * @category Ninja Layer Types
 * 
 * 📊 TYPES & INTERFACES
 * Type definitions for the Ninja Layer components
 */
export type {
  // Ninja Layer Types
  ShinobiConfig,
  KataConfig,
  ClanConfig,
  DojoConfig,
  ClanStrategy,
  DojoStep
} from './ninja/types';

/**
 * @group Type Definitions
 * @category Thought System Types
 * 
 * Type definitions for the Thought System components
 */
export type {
  // Thought System Types
  ThoughtModuleConfig,
  ThoughtContext,
  ThoughtResult,
  PromptTemplateConfig,
  PromptStrategyConfig,
  ExecutionTrace
} from './thought/types';

/**
 * @group Type Definitions
 * @category Scroll Layer Types
 * 
 * Type definitions for the Scroll Layer components
 */
export type {
  // Scroll Layer Types
  ScrollConfig,
  ScrollResponse,
  ScrollStreamResponse,
  GenerateTextOptions,
  GenerateObjectOptions,
  StreamTextOptions,
  StreamObjectOptions
} from './scroll/types';

/**
 * @group Type Definitions
 * @category Core Types
 * 
 * Core type definitions used throughout the framework
 */
export type {
  // Core Types (Existing)
  ExecutionResult,
  BillingInfo,
  TokenUsage,
  OpenAIParameters,
  ShinobiPersonaContext
} from './core/types';

/**
 * @group Type Definitions
 * @category Legacy Types
 * 
 * Legacy type definitions for backward compatibility
 */
export type {
  // Legacy exports for backward compatibility
  MemoryConfig,
  LogEntry
} from './core/memory';