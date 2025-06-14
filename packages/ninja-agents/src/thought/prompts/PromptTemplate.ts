import type { PromptTemplateConfig } from '../types.js';

/**
 * Dynamic prompt template processor with variable injection and partials support.
 * Supports Handlebars-like syntax for template rendering.
 */
export class PromptTemplate {
  private config: PromptTemplateConfig;

  constructor(config: PromptTemplateConfig) {
    this.config = config;
  }

  /**
   * Render the template with provided context
   */
  render(context: Record<string, any>): string {
    let rendered = this.config.template;

    // Replace variables
    const allVariables = { ...this.config.variables, ...context };
    
    // Simple variable replacement {{variable}}
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return allVariables[key] !== undefined ? String(allVariables[key]) : match;
    });

    // Handle arrays with {{#each array}} syntax
    rendered = rendered.replace(/\{\{#each (\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayKey, template) => {
      const array = allVariables[arrayKey];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        return template.replace(/\{\{this\}\}/g, String(item));
      }).join('');
    });

    // Handle conditionals {{#if condition}} syntax
    rendered = rendered.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, conditionKey, template) => {
      const condition = allVariables[conditionKey];
      return condition ? template : '';
    });

    // Apply partials
    if (this.config.partials) {
      Object.entries(this.config.partials).forEach(([key, partial]) => {
        const partialRegex = new RegExp(`\\{\\{>${key}\\}\\}`, 'g');
        rendered = rendered.replace(partialRegex, partial);
      });
    }

    return rendered.trim();
  }

  /**
   * Extract variables from template
   */
  getVariables(): string[] {
    const variables = new Set<string>();
    const regex = /\{\{(\w+)\}\}/g;
    let match;

    while ((match = regex.exec(this.config.template)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Validate that all required variables are provided
   */
  validate(context: Record<string, any>): { valid: boolean; missing: string[] } {
    const required = this.getVariables();
    const provided = Object.keys(context);
    const missing = required.filter(key => !provided.includes(key));

    return {
      valid: missing.length === 0,
      missing
    };
  }
}