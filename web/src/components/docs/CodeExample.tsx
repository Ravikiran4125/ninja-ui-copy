'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Copy, Check, Play, Eye, Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeExampleProps {
  title?: string;
  description?: string;
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  runnable?: boolean;
  onRun?: (code: string) => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export function CodeExample({
  title,
  description,
  code,
  language = 'typescript',
  showLineNumbers = true,
  highlightLines = [],
  runnable = false,
  onRun,
  className,
  theme = 'auto'
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Detect system theme
  useState(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    } else {
      setIsDark(theme === 'dark');
    }
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code);
    }
  };

  const customStyle = {
    margin: 0,
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    ...(highlightLines.length > 0 && {
      '.line-highlight': {
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        display: 'block',
        marginLeft: '-1rem',
        marginRight: '-1rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }
    })
  };

  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Header */}
      {(title || description) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Block */}
      {isExpanded && (
        <div className="relative group">
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {runnable && (
              <button
                onClick={handleRun}
                className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
                title="Run code"
              >
                <Play size={16} />
              </button>
            )}
            <button
              onClick={handleCopy}
              className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {/* Syntax Highlighter */}
          <SyntaxHighlighter
            style={isDark ? oneDark : oneLight}
            language={language}
            showLineNumbers={showLineNumbers}
            customStyle={customStyle}
            wrapLines={highlightLines.length > 0}
            lineProps={(lineNumber) => ({
              style: highlightLines.includes(lineNumber) ? {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                display: 'block',
                marginLeft: '-1rem',
                marginRight: '-1rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
              } : {}
            })}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Collapsed State */}
      {!isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <Code size={16} />
            <span className="text-sm">Code example collapsed</span>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Show code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Preset code examples for common use cases
export const codeExamples = {
  quickStart: `import { Shinobi, Shuriken, KataRuntime, Logger, Memory } from 'ninja-agents';
import { z } from 'zod';
import OpenAI from 'openai';

// Initialize core services
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const memory = new Memory({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});
const logger = new Logger('info', 'MyApp', memory);
const runtime = new KataRuntime(openai, logger, memory);

// Create a simple capability
const calculatorShuriken = new Shuriken(
  'calculate',
  'Perform mathematical calculations',
  z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  (params) => {
    switch (params.operation) {
      case 'add': return params.a + params.b;
      case 'subtract': return params.a - params.b;
      case 'multiply': return params.a * params.b;
      case 'divide': return params.a / params.b;
    }
  }
);

// Create and execute a Shinobi
const mathExpert = new Shinobi(runtime, {
  role: 'Mathematics Expert',
  description: 'A skilled mathematician',
  backstory: 'PhD in Mathematics with 20 years of experience',
  shurikens: [calculatorShuriken],
  katas: [{
    model: 'gpt-4o-mini',
    title: 'Problem Solver',
    description: 'Solve mathematical problems step by step'
  }]
});

const result = await mathExpert.execute('What is 15% of 240, then multiply by 3?');`,

  shurikenCreation: `import { Shuriken } from 'ninja-agents';
import { z } from 'zod';

// Define the parameter schema
const weatherSchema = z.object({
  city: z.string().describe('The city name to get weather for'),
  unit: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature unit')
});

// Create the shuriken with implementation
const weatherShuriken = new Shuriken(
  'get_weather',
  'Get current weather information for a specific city',
  weatherSchema,
  async (params) => {
    // In a real app, you'd call a weather API
    const response = await fetch(\`https://api.weather.com/\${params.city}\`);
    const data = await response.json();
    
    return {
      city: params.city,
      temperature: data.temperature,
      condition: data.condition,
      humidity: data.humidity
    };
  }
);

// Use the shuriken
const result = await weatherShuriken.execute({
  city: 'Paris',
  unit: 'celsius'
});`,

  kataConfiguration: `import { Kata } from 'ninja-agents';

// Create a specialized AI agent
const weatherAnalyst = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Weather Analysis Specialist',
  description: 'Analyze weather conditions and provide travel recommendations',
  shurikens: [weatherShuriken, calculatorShuriken],
  parameters: {
    temperature: 0.7,
    max_tokens: 1000
  },
  stream: false,
  requiresHumanInput: false
});

// Execute the kata
const analysis = await weatherAnalyst.execute(
  'What should I pack for a trip to Tokyo in December?'
);`,

  shinobiOrchestration: `import { Shinobi } from 'ninja-agents';

// Create a persona-driven orchestrator
const travelExpert = new Shinobi(runtime, {
  role: 'Expert Travel Assistant',
  description: 'Knowledgeable travel expert with comprehensive planning abilities',
  backstory: 'I have 15+ years of experience in the travel industry, helping thousands of travelers plan perfect trips.',
  
  // Shared capabilities across all katas
  shurikens: [weatherShuriken, calculatorShuriken, searchShuriken],
  
  // Specialized agents within this shinobi
  katas: [
    {
      model: 'gpt-4o-mini',
      title: 'Weather Analysis Specialist',
      description: 'Analyze weather conditions for travel planning'
    },
    {
      model: 'gpt-4o-mini',
      title: 'Cost Calculator',
      description: 'Calculate travel costs and budgets'
    },
    {
      model: 'gpt-4o-mini',
      title: 'Destination Advisor',
      description: 'Provide destination recommendations and tips'
    }
  ]
});

// Execute complex travel planning
const travelPlan = await travelExpert.execute(
  'Plan a 7-day trip to Japan in March for 2 people, budget $3000'
);`
};