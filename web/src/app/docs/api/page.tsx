import fs from 'fs';
import path from 'path';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { PackageOverview } from '@/components/docs/PackageOverview';
import { APIReference } from '@/components/docs/APIReference';
import { CodeExample, codeExamples } from '@/components/docs/CodeExample';
import { InteractivePlayground, playgroundTemplates } from '@/components/docs/InteractivePlayground';
import { MethodPropsTable } from '@/components/docs/MethodPropsTable';
import { LegacyDocsRenderer, createLegacyDocsFromMarkdown } from '@/components/docs/LegacyDocsRenderer';
import { SearchableContent, createSearchableContent } from '@/components/docs/SearchableContent';
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

// Server-side function to read API documentation
function getAPIDocumentation() {
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

  return apiContent;
}

export default function APIDocsPage() {
  // Read the API documentation on the server
  const apiContent = getAPIDocumentation();

  // Create legacy docs from markdown files - now done on server
  const legacyDocs = createLegacyDocsFromMarkdown([
    {
      filename: 'API.md',
      content: apiContent,
      frontmatter: {
        title: 'API Reference',
        category: 'Reference',
        tags: ['api', 'reference', 'typescript']
      }
    }
  ]);

  // Create searchable content - now done on server
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
        {/* Search */}
        <SearchableContent
          content={searchableContent}
          onResultClick={(result) => {
            console.log('Navigate to:', result);
            // Implement navigation logic
          }}
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
          onExecute={async (code) => {
            // Mock execution - in a real app, this would run the code
            return `// Code executed successfully\n// Output would appear here\nconsole.log("Shuriken created and executed!");`;
          }}
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