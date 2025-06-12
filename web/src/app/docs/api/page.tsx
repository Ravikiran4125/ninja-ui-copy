import fs from 'fs';
import path from 'path';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import DocsLayout from '../layout';

export default function APIDocsPage() {
  // Read the API documentation
  const apiDocsPath = path.resolve(process.cwd(), '../packages/ninja-agents/API.md');
  let apiContent = '';
  
  try {
    if (fs.existsSync(apiDocsPath)) {
      apiContent = fs.readFileSync(apiDocsPath, 'utf8');
    } else {
      apiContent = `# API Documentation

The API documentation is being generated. Please check back soon.

## Quick Reference

### Core Components

- **Shuriken**: Atomic tools and capabilities
- **Kata**: Specialized AI agents
- **Shinobi**: Persona-driven orchestrators
- **Memory**: Persistent storage and logging
- **KataRuntime**: Dependency injection container

### Basic Usage

\`\`\`typescript
import { Shinobi, Kata, Shuriken, KataRuntime, Logger, Memory } from 'ninja-agents';

// Initialize runtime
const runtime = new KataRuntime(openai, logger, memory);

// Create and execute agents
const agent = new Shinobi(runtime, config);
const result = await agent.execute(userQuery);
\`\`\`
`;
    }
  } catch (error) {
    console.error('Error reading API docs:', error);
    apiContent = '# API Documentation\n\nError loading documentation. Please try again later.';
  }

  return (
    <DocsLayout>
      <div className="max-w-4xl">
        <MarkdownRenderer content={apiContent} />
      </div>
    </DocsLayout>
  );
}