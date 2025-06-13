import type { PromptStrategyConfig, ThoughtContext } from '../types.js';

/**
 * Advanced reasoning strategies that can be applied to prompts.
 * Implements Chain of Thought, Reflection, Multi-perspective analysis, etc.
 */
export class PromptStrategy {
  private config: PromptStrategyConfig;

  constructor(config: PromptStrategyConfig) {
    this.config = config;
  }

  /**
   * Apply the strategy to enhance the prompt
   */
  async apply(prompt: string, context: ThoughtContext): Promise<{
    prompt: string;
    reasoning?: string;
  }> {
    switch (this.config.type) {
      case 'chain-of-thought':
        return this.applyChainOfThought(prompt);
      
      case 'reflection':
        return this.applyReflection(prompt, context);
      
      case 'multi-perspective':
        return this.applyMultiPerspective(prompt);
      
      case 'retry':
        return this.applyRetry(prompt);
      
      case 'validation':
        return this.applyValidation(prompt);
      
      default:
        return { prompt };
    }
  }

  /**
   * Chain of Thought reasoning
   */
  private applyChainOfThought(prompt: string): { prompt: string; reasoning: string } {
    const enhancedPrompt = `${prompt}

Let's think through this step by step:

1. First, I'll analyze the key components of this problem
2. Then, I'll consider the relationships between these components
3. Next, I'll evaluate possible approaches or solutions
4. Finally, I'll provide a well-reasoned conclusion

Step-by-step reasoning:`;

    return {
      prompt: enhancedPrompt,
      reasoning: 'Applied Chain of Thought strategy for systematic reasoning'
    };
  }

  /**
   * Reflection strategy
   */
  private applyReflection(prompt: string, context: ThoughtContext): { prompt: string; reasoning: string } {
    const enhancedPrompt = `${prompt}

After providing your initial response, please reflect on your answer by considering:
- Are there any assumptions I made that should be questioned?
- What alternative perspectives or approaches exist?
- How confident am I in this response and why?
- What additional information would improve this analysis?

Initial Response:
[Provide your response here]

Reflection:
[Reflect on your response here]`;

    return {
      prompt: enhancedPrompt,
      reasoning: 'Applied Reflection strategy for self-evaluation and improvement'
    };
  }

  /**
   * Multi-perspective analysis
   */
  private applyMultiPerspective(prompt: string): { prompt: string; reasoning: string } {
    const perspectives = this.config.config?.perspectives || ['technical', 'business', 'user'];
    
    const perspectivePrompts = perspectives.map(p => 
      `${p.charAt(0).toUpperCase() + p.slice(1)} Perspective:`
    ).join('\n');

    const enhancedPrompt = `${prompt}

Please analyze this from multiple perspectives:

${perspectivePrompts}

Synthesis:
[Combine insights from all perspectives]`;

    return {
      prompt: enhancedPrompt,
      reasoning: `Applied Multi-perspective strategy with ${perspectives.join(', ')} viewpoints`
    };
  }

  /**
   * Retry strategy
   */
  private applyRetry(prompt: string): { prompt: string; reasoning: string } {
    const enhancedPrompt = `${prompt}

Please provide a thorough and accurate response. If you're uncertain about any aspect, please indicate your level of confidence and suggest how the answer could be improved with additional information.`;

    return {
      prompt: enhancedPrompt,
      reasoning: 'Applied Retry strategy for improved accuracy'
    };
  }

  /**
   * Validation strategy
   */
  private applyValidation(prompt: string): { prompt: string; reasoning: string } {
    const enhancedPrompt = `${prompt}

Before finalizing your response, please validate it by:
1. Checking for logical consistency
2. Verifying factual accuracy where possible
3. Ensuring completeness of the answer
4. Confirming it addresses the original question

Response:
[Your validated response here]`;

    return {
      prompt: enhancedPrompt,
      reasoning: 'Applied Validation strategy for quality assurance'
    };
  }

  /**
   * Get strategy type
   */
  getType(): string {
    return this.config.type;
  }

  /**
   * Static factory methods for common strategies
   */
  static chainOfThought(): PromptStrategy {
    return new PromptStrategy({ type: 'chain-of-thought' });
  }

  static reflection(): PromptStrategy {
    return new PromptStrategy({ type: 'reflection' });
  }

  static multiPerspective(perspectives: string[] = ['technical', 'business', 'user']): PromptStrategy {
    return new PromptStrategy({ 
      type: 'multi-perspective', 
      config: { perspectives } 
    });
  }

  static retry(maxAttempts: number = 3): PromptStrategy {
    return new PromptStrategy({ 
      type: 'retry', 
      config: { maxAttempts } 
    });
  }

  static validation(): PromptStrategy {
    return new PromptStrategy({ type: 'validation' });
  }
}