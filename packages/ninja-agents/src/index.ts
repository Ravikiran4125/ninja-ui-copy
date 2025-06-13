// Main package exports - Dual-layer architecture

// 🥷 NINJA LAYER (User-Facing API)
export { 
  Shinobi, 
  Kata, 
  Shuriken, 
  Clan, 
  Dojo 
} from './ninja/index';

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
} from './thought/index';

// 📜 SCROLL LAYER (LLM Provider Abstraction)
export {
  Scroll,
  OpenAIScroll
} from './scroll/index';

// 🛠️ CORE UTILITIES (Existing)
export {
  KataRuntime,
  Memory,
  Logger
} from './core/index';

// 📊 TYPES & INTERFACES
export type {
  // Ninja Layer Types
  ShinobiConfig,
  KataConfig,
  ClanConfig,
  DojoConfig,
  ClanStrategy,
  DojoStep
} from './ninja/types';

export type {
  // Thought System Types
  ThoughtModuleConfig,
  ThoughtContext,
  ThoughtResult,
  PromptTemplateConfig,
  PromptStrategyConfig,
  ExecutionTrace
} from './thought/types';

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

export type {
  // Core Types (Existing)
  ExecutionResult,
  BillingInfo,
  TokenUsage,
  OpenAIParameters,
  ShinobiPersonaContext
} from './core/types';

export type {
  // Legacy exports for backward compatibility
  MemoryConfig,
  LogEntry
} from './core/memory';