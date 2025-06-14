/**
 * @fileoverview Thought System Layer - Internal Reasoning Engine
 * 
 * ⚠️ **CRITICAL ARCHITECTURAL REQUIREMENT**
 * 
 * **The Thought Module Layer functionality is EXCLUSIVELY available for Ninja Layer components only.**
 * 
 * This module provides advanced reasoning capabilities that are designed to be accessed
 * only through the Ninja Layer (Shinobi, Kata, Clan, Dojo). Direct access to these
 * components from user code violates the architectural design and security model.
 * 
 * @example ✅ CORRECT: Access through Ninja Layer
 * ```typescript
 * import { Shinobi, Kata } from 'ninja-agents';
 * 
 * // Enhanced Shinobi with thought capabilities
 * const shinobi = new Shinobi(runtime, {
 *   role: 'Advanced Analyst',
 *   thoughtModules: [thoughtConfig], // ✅ Proper access
 *   katas: [{
 *     thoughtModule: kataThoughtConfig // ✅ Proper access
 *   }]
 * });
 * ```
 * 
 * @example ❌ INCORRECT: Direct access (violates architecture)
 * ```typescript
 * import { ThoughtModule } from 'ninja-agents';
 * 
 * // Direct instantiation - AVOID THIS
 * const thought = new ThoughtModule(config, executor); // ❌ Bypasses Ninja Layer
 * ```
 * 
 * @see {@link ../ninja/README.md} For proper Ninja Layer usage
 * @see {@link ./README.md} For detailed architectural requirements
 * 
 * @packageDocumentation
 * @internal This module is for internal use by Ninja Layer components only
 * @since 1.0.0
 */

/**
 * @group Thought System
 * @category Core Components
 * 
 * 🧠 THOUGHT SYSTEM CORE COMPONENTS
 * 
 * **⚠️ NINJA LAYER ACCESS ONLY**
 * These components are exclusively available through Ninja Layer components.
 * Direct instantiation violates architectural principles and security boundaries.
 */
export { ThoughtModule } from './core/ThoughtModule';
export { ThoughtRuntime } from './core/ThoughtRuntime';
export { ThoughtGraph } from './core/ThoughtGraph';
export { ThoughtMemory } from './core/ThoughtMemory';
export { ThoughtTrace } from './core/ThoughtTrace';

/**
 * @group Thought System
 * @category Prompt Components
 * 
 * 📝 PROMPT SYSTEM COMPONENTS
 * 
 * **⚠️ NINJA LAYER ACCESS ONLY**
 * Advanced prompting capabilities for sophisticated reasoning patterns.
 */
export { PromptTemplate } from './prompts/PromptTemplate';
export { PromptStrategy } from './prompts/PromptStrategy';
export { PromptExecutor } from './prompts/PromptExecutor';

/**
 * @group Thought System
 * @category Type Definitions
 * 
 * 📊 THOUGHT SYSTEM TYPES
 * 
 * Type definitions for the Thought System components.
 * These types are used internally by Ninja Layer components.
 */
export type {
  ThoughtModuleConfig,
  ThoughtContext,
  ThoughtResult,
  PromptTemplateConfig,
  PromptStrategyConfig,
  ExecutionTrace
} from './types';

/**
 * @internal
 * @deprecated Direct access to Thought System is not supported
 * 
 * This warning is displayed when attempting to import Thought System components directly.
 * Use Ninja Layer components (Shinobi, Kata) with thoughtModule configurations instead.
 */
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Only show warning in Node.js environment to avoid browser console spam
  const stack = new Error().stack;
  if (stack && !stack.includes('ninja/core/')) {
    console.warn(`
⚠️  WARNING: Direct Thought System Access Detected

The Thought System is designed for Ninja Layer access only.
Direct imports may violate architectural principles.

✅ CORRECT: Use Ninja Layer components
   import { Shinobi, Kata } from 'ninja-agents';

❌ AVOID: Direct Thought System imports
   import { ThoughtModule } from 'ninja-agents';

See documentation: packages/ninja-agents/src/thought/README.md
`);
  }
}