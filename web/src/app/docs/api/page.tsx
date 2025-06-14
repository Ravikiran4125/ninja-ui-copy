import fs from 'fs';
import path from 'path';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { PackageOverview } from '@/components/docs/PackageOverview';
import { APIReference } from '@/components/docs/APIReference';
import { CodeExample, codeExamples } from '@/components/docs/CodeExample';
import { InteractivePlayground, playgroundTemplates } from '@/components/docs/InteractivePlayground';
import { MethodPropsTable } from '@/components/docs/MethodPropsTable';
import { LegacyDocsRenderer } from '@/components/docs/LegacyDocsRenderer';
import { SearchableContent } from '@/components/docs/SearchableContent';
import DocsLayout from '../layout';

// Mock data for demonstration - in a real app, this would come from parsing the actual package
const packageInfo = {
  name: 'ninja-agents',
  version: '1.0.0',
  description: 'A comprehensive TypeScript framework for building sophisticated AI crew orchestration systems',
  author: 'Ninja Agents Team',
  license: 'MIT',
  repository: 'https://github.com/ninja-agents/ninja-agents',
  homepage: 'https://ninja-agents.dev',
  keywords: ['ai', 'typescript', 'agents', 'orchestration', 'openai', 'crew', 'shinobi', 'kata', 'shuriken'],
  downloads: 15420,
  stars: 342,
  lastUpdated: '2 days ago',
  dependencies: {
    'openai': '^4.0.0',
    'zod': '^3.0.0',
    'chalk': '^5.0.0',
    '@supabase/supabase-js': '^2.0.0'
  },
  peerDependencies: {
    'typescript': '^5.0.0'
  }
};

const apiDefinitions = [
  {
    name: 'Shuriken',
    type: 'class' as const,
    description: 'Represents an AI capability or function that can be invoked by an AI agent.',
    properties: [
      {
        name: 'name',
        type: 'string',
        description: 'The name of the shuriken function',
        optional: false,
        readonly: true
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of what the shuriken does',
        optional: false,
        readonly: true
      }
    ],
    methods: [
      {
        name: 'execute',
        description: 'Executes the shuriken with validated parameters',
        parameters: [
          {
            name: 'parameters',
            type: 'any',
            description: 'Parameters to pass to the shuriken implementation'
          }
        ],
        returnType: 'Promise<ExecutionResult<any>>',
        examples: [
          'const result = await shuriken.execute({ city: "Paris" });'
        ]
      },
      {
        name: 'validate',
        description: 'Validates parameters against the shuriken schema',
        parameters: [
          {
            name: 'parameters',
            type: 'any',
            description: 'Parameters to validate'
          }
        ],
        returnType: '{ success: boolean; data?: any; error?: string }',
        examples: [
          'const validation = shuriken.validate({ city: "Paris" });'
        ]
      },
      {
        name: 'forge',
        description: 'Generates the OpenAI tool definition for this shuriken',
        returnType: 'OpenAI.Chat.Completions.ChatCompletionTool',
        examples: [
          'const toolDef = shuriken.forge();'
        ]
      }
    ],
    examples: [
      `const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather information',
  z.object({ city: z.string() }),
  async (params) => ({ temperature: 25, condition: 'Sunny' })
);`
    ]
  },
  {
    name: 'Kata',
    type: 'class' as const,
    description: 'Represents a specialized AI agent focused on specific tasks and workflows.',
    properties: [
      {
        name: 'config',
        type: 'KataConfig',
        description: 'Configuration object for the Kata',
        optional: false,
        readonly: true
      }
    ],
    methods: [
      {
        name: 'execute',
        description: 'Executes the kata with a user query',
        parameters: [
          {
            name: 'userQuery',
            type: 'string',
            description: 'The user\'s request or question'
          }
        ],
        returnType: 'Promise<ExecutionResult<string | any>>',
        examples: [
          'const result = await kata.execute("What\'s the weather like?");'
        ]
      },
      {
        name: 'addShuriken',
        description: 'Adds a shuriken capability to this kata',
        parameters: [
          {
            name: 'shuriken',
            type: 'Shuriken',
            description: 'The shuriken to add'
          }
        ],
        returnType: 'void',
        examples: [
          'kata.addShuriken(weatherShuriken);'
        ]
      }
    ],
    examples: [
      `const kata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Weather Analyst',
  description: 'Analyze weather conditions',
  shurikens: [weatherShuriken]
});`
    ]
  },
  {
    name: 'Shinobi',
    type: 'class' as const,
    description: 'Persona-driven orchestrator that manages multiple specialized agents (Katas).',
    properties: [
      {
        name: 'config',
        type: 'ShinobiConfig',
        description: 'Configuration object for the Shinobi',
        optional: false,
        readonly: true
      }
    ],
    methods: [
      {
        name: 'execute',
        description: 'Executes the Shinobi workflow with all configured katas',
        parameters: [
          {
            name: 'userQuery',
            type: 'string',
            description: 'The user\'s request or question'
          }
        ],
        returnType: 'Promise<ExecutionResult<ShinobiExecutionResult>>',
        examples: [
          'const result = await shinobi.execute("Plan a trip to Paris");'
        ]
      },
      {
        name: 'addSharedShuriken',
        description: 'Adds a shuriken to be shared across all katas',
        parameters: [
          {
            name: 'shuriken',
            type: 'Shuriken',
            description: 'The shuriken to add'
          }
        ],
        returnType: 'void',
        examples: [
          'shinobi.addSharedShuriken(calculatorShuriken);'
        ]
      }
    ],
    examples: [
      `const shinobi = new Shinobi(runtime, {
  role: 'Travel Expert',
  description: 'Expert travel assistant',
  backstory: '15+ years in travel industry',
  katas: [weatherAnalyst, costCalculator]
});`
    ]
  }
];

const methodPropsData = [
  {
    id: '1',
    name: 'execute',
    type: 'Promise<ExecutionResult<any>>',
    description: 'Executes the shuriken with validated parameters and returns the result',
    required: true,
    examples: ['await shuriken.execute({ city: "Paris" })']
  },
  {
    id: '2',
    name: 'validate',
    type: '{ success: boolean; data?: any; error?: string }',
    description: 'Validates parameters against the defined Zod schema',
    required: true,
    examples: ['shuriken.validate({ city: "Paris" })']
  },
  {
    id: '3',
    name: 'forge',
    type: 'OpenAI.Chat.Completions.ChatCompletionTool',
    description: 'Generates OpenAI-compatible tool definition',
    required: true,
    examples: ['const toolDef = shuriken.forge()']
  },
  {
    id: '4',
    name: 'getName',
    type: 'string',
    description: 'Returns the name of the shuriken',
    required: true,
    examples: ['const name = shuriken.getName()']
  },
  {
    id: '5',
    name: 'getDescription',
    type: 'string',
    description: 'Returns the description of the shuriken',
    required: true,
    examples: ['const desc = shuriken.getDescription()']
  }
];

const tableColumns = [
  { key: 'name', label: 'Method', sortable: true },
  { key: 'type', label: 'Return Type', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
  { key: 'required', label: 'Required', sortable: true }
];

// Server-side helper functions
function createLegacyDocsFromMarkdown(markdownFiles: Array<{
  filename: string;
  content: string;
  frontmatter?: Record<string, any>;
}>): Array<{
  id: string;
  title: string;
  content: string;
  category?: string;
  lastModified?: Date;
  tags?: string[];
}> {
  return markdownFiles.map((file, index) => ({
    id: `doc-${index}`,
    title: file.frontmatter?.title || file.filename.replace('.md', ''),
    content: file.content,
    category: file.frontmatter?.category || 'General',
    lastModified: file.frontmatter?.lastModified ? new Date(file.frontmatter.lastModified) : new Date(),
    tags: file.frontmatter?.tags || []
  }));
}

function createSearchableContent(docs: any[]): Array<{
  id: string;
  title: string;
  type: 'section' | 'method' | 'property' | 'example' | 'guide';
  content: string;
  url?: string;
  category?: string;
  relevance: number;
}> {
  const results: Array<{
    id: string;
    title: string;
    type: 'section' | 'method' | 'property' | 'example' | 'guide';
    content: string;
    url?: string;
    category?: string;
    relevance: number;
  }> = [];

  docs.forEach(doc => {
    // Add main sections
    if (doc.sections) {
      doc.sections.forEach((section: any) => {
        results.push({
          id: `${doc.id}-${section.id}`,
          title: section.title,
          type: 'section',
          content: section.content,
          category: doc.title,
          relevance: 0
        });
      });
    }

    // Add methods
    if (doc.methods) {
      doc.methods.forEach((method: any) => {
        results.push({
          id: `${doc.id}-method-${method.name}`,
          title: method.name,
          type: 'method',
          content: method.description || '',
          category: doc.title,
          relevance: 0
        });
      });
    }

    // Add properties
    if (doc.properties) {
      doc.properties.forEach((prop: any) => {
        results.push({
          id: `${doc.id}-prop-${prop.name}`,
          title: prop.name,
          type: 'property',
          content: prop.description || '',
          category: doc.title,
          relevance: 0
        });
      });
    }

    // Add examples
    if (doc.examples) {
      doc.examples.forEach((example: any, index: number) => {
        results.push({
          id: `${doc.id}-example-${index}`,
          title: example.title || `Example ${index + 1}`,
          type: 'example',
          content: example.code || example.description || '',
          category: doc.title,
          relevance: 0
        });
      });
    }
  });

  return results;
}

export default function APIDocsPage() {
  // Read the API documentation
  const apiDocsPath = path.resolve(process.cwd(), '../packages/ninja-agents/API.md');
  let apiContent = '';
  
  try {
    if (fs.existsSync(apiDocsPath)) {
      apiContent = fs.readFileSync(apiDocsPath, 'utf8');
    } else {
      apiContent = `# API Documentation

The API documentation is being generated automatically using TypeDoc. 

## TypeDoc Integration

This documentation is generated from the TypeScript source code in the \`ninja-agents\` package using TypeDoc. The documentation includes:

- **Comprehensive API Reference**: All classes, interfaces, types, and functions
- **Code Examples**: Real-world usage examples embedded in the source code
- **Type Information**: Complete TypeScript type definitions
- **Cross-References**: Links between related components

## Generating Documentation

To generate the latest API documentation:

\`\`\`bash
cd packages/ninja-agents
npm run docs:generate
\`\`\`

This will create a complete HTML documentation site in the \`docs/\` directory.

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

## TypeDoc Features

The generated documentation includes:

- **Grouped Organization**: Components are organized by functional groups
- **Search Functionality**: Full-text search across all documentation
- **Type Safety**: Complete TypeScript type information
- **Examples**: Code examples from TSDoc comments
- **Cross-Links**: Navigation between related components
- **Version Information**: Tracks changes across versions

## Accessing Generated Docs

Once generated, the TypeDoc documentation can be:

1. **Served Locally**: Use \`npm run docs:serve\` for live development
2. **Deployed Statically**: Host the \`docs/\` folder on any static site host
3. **Integrated**: Parse the JSON output for custom documentation UIs

The documentation is automatically kept in sync with the source code through TSDoc comments.
`;
    }
  } catch (error) {
    console.error('Error reading API docs:', error);
    apiContent = '# API Documentation\n\nError loading documentation. Please try again later.';
  }

  // Create legacy docs from markdown files
  const legacyDocs = createLegacyDocsFromMarkdown([
    {
      filename: 'API.md',
      content: apiContent,
      frontmatter: {
        title: 'API Reference',
        category: 'Reference',
        tags: ['api', 'reference', 'typescript', 'typedoc']
      }
    }
  ]);

  // Create searchable content
  const searchableContent = createSearchableContent([
    {
      id: 'shuriken',
      title: 'Shuriken',
      sections: [
        {
          id: 'overview',
          title: 'Shuriken Overview',
          content: 'Atomic AI capabilities that can be invoked by agents'
        }
      ],
      methods: apiDefinitions.find(def => def.name === 'Shuriken')?.methods || [],
      properties: apiDefinitions.find(def => def.name === 'Shuriken')?.properties || []
    }
  ]);

  return (
    <DocsLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* TypeDoc Integration Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                TypeDoc Integration Active
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-3">
                This API documentation is automatically generated from TypeScript source code using TypeDoc. 
                The documentation includes comprehensive type information, examples, and cross-references.
              </p>
              <div className="flex flex-wrap gap-2">
                <code className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">
                  npm run docs:generate
                </code>
                <code className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">
                  npm run docs:serve
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <SearchableContent
          content={searchableContent}
          className="mb-8"
        />

        {/* Package Overview */}
        <PackageOverview packageInfo={packageInfo} />

        {/* Quick Start Example */}
        <CodeExample
          title="Quick Start"
          description="Get started with Ninja Agents in just a few lines of code"
          code={codeExamples.quickStart}
          language="typescript"
          runnable={false}
        />

        {/* API Reference */}
        <APIReference definitions={apiDefinitions} />

        {/* Interactive Playground */}
        <InteractivePlayground
          initialCode={playgroundTemplates.basicShuriken}
          language="typescript"
        />

        {/* Method/Props Table */}
        <MethodPropsTable
          title="Shuriken Methods"
          description="Complete list of methods available on the Shuriken class"
          columns={tableColumns}
          data={methodPropsData}
          searchable={true}
          filterable={true}
          expandable={true}
        />

        {/* Code Examples */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Code Examples</h2>
          
          <CodeExample
            title="Creating a Shuriken"
            description="Learn how to create a custom AI capability"
            code={codeExamples.shurikenCreation}
            language="typescript"
            highlightLines={[1, 5, 15]}
          />

          <CodeExample
            title="Configuring a Kata"
            description="Set up a specialized AI agent with specific capabilities"
            code={codeExamples.kataConfiguration}
            language="typescript"
          />

          <CodeExample
            title="Shinobi Orchestration"
            description="Create a persona-driven orchestrator with multiple agents"
            code={codeExamples.shinobiOrchestration}
            language="typescript"
          />
        </div>

        {/* Legacy Documentation */}
        <LegacyDocsRenderer docs={legacyDocs} />

        {/* Full API Documentation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Complete API Documentation
          </h2>
          <MarkdownRenderer content={apiContent} />
        </div>
      </div>
    </DocsLayout>
  );
}