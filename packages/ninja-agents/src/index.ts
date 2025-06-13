// Main package exports - Dual-layer architecture

// 🥷 NINJA LAYER (User-Facing API)
export { 
  Shinobi, 
  Kata, 
  Shuriken, 
  Clan, 
  Dojo 
} from './ninja/index.js';

// 🧠 THOUGHT SYSTEM (Internal Reasoning Engine)
export {
  ThoughtModule,
  ThoughtRuntime,
  ThoughtGraph,
  ThoughtMemory,
  ThoughtTrace,
  PromptTemplate,
  PromptStrategy,
  PromptExecutor
} from './thought/index.js';

// 📜 SCROLL LAYER (LLM Provider Abstraction)
export {
  Scroll,
  OpenAIScroll
} from './scroll/index.js';

// 🛠️ CORE UTILITIES (Existing)
export {
  KataRuntime,
  Memory,
  Logger
} from './core/index.js';

// 📊 TYPES & INTERFACES
export type {
  // Ninja Layer Types
  ShinobiConfig,
  KataConfig,
  ClanConfig,
  DojoConfig,
  ClanStrategy,
  DojoStep
} from './ninja/types.js';

export type {
  // Thought System Types
  ThoughtModuleConfig,
  ThoughtContext,
  ThoughtResult,
  PromptTemplateConfig,
  PromptStrategyConfig,
  ExecutionTrace
} from './thought/types.js';

export type {
  // Scroll Layer Types
  ScrollConfig,
  ScrollResponse,
  ScrollStreamResponse,
  GenerateTextOptions,
  GenerateObjectOptions,
  StreamTextOptions,
  StreamObjectOptions
} from './scroll/types.js';

export type {
  // Core Types (Existing)
  ExecutionResult,
  BillingInfo,
  TokenUsage,
  OpenAIParameters,
  ShinobiPersonaContext
} from './core/types.js';

export type {
  // Legacy exports for backward compatibility
  MemoryConfig,
  LogEntry
} from './core/memory.js';