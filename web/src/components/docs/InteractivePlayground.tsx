'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Play, Square, RotateCcw, Settings, Download, Upload } from 'lucide-react';
import { CodeExample } from './CodeExample';

interface PlaygroundProps {
  initialCode?: string;
  language?: string;
  onExecute?: (code: string) => Promise<any>;
  className?: string;
}

export function InteractivePlayground({ 
  initialCode = '', 
  language = 'typescript',
  onExecute,
  className 
}: PlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    autoRun: false,
    showOutput: true,
    theme: 'dark' as 'light' | 'dark'
  });

  const handleRun = async () => {
    if (!onExecute) {
      setOutput('// Playground execution not implemented yet\nconsole.log("Code would run here");');
      return;
    }

    setIsRunning(true);
    setError(null);
    
    try {
      const result = await onExecute(code);
      setOutput(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setError(null);
  };

  const handleSave = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playground-${Date.now()}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Interactive Playground
          </h3>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
            {language}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".ts,.js,.tsx,.jsx"
            onChange={handleLoad}
            className="hidden"
            id="load-file"
          />
          <label
            htmlFor="load-file"
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
            title="Load file"
          >
            <Upload size={16} />
          </label>
          
          <button
            onClick={handleSave}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Save code"
          >
            <Download size={16} />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Reset to initial code"
          >
            <RotateCcw size={16} />
          </button>
          
          <button
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              isRunning
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {isRunning ? <Square size={16} /> : <Play size={16} />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-96">
        {/* Input */}
        <div className="border-r border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</h4>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none border-none outline-none"
            placeholder="Enter your TypeScript code here..."
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</h4>
          </div>
          <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 overflow-auto">
            {error ? (
              <div className="text-red-600 dark:text-red-400 font-mono text-sm whitespace-pre-wrap">
                Error: {error}
              </div>
            ) : output ? (
              <pre className="text-gray-800 dark:text-gray-200 font-mono text-sm whitespace-pre-wrap">
                {output}
              </pre>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                Click "Run" to execute your code and see the output here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoRun}
              onChange={(e) => setSettings(prev => ({ ...prev, autoRun: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-run on change</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showOutput}
              onChange={(e) => setSettings(prev => ({ ...prev, showOutput: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show output panel</span>
          </label>
          
          <select
            value={settings.theme}
            onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
            className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value="light">Light theme</option>
            <option value="dark">Dark theme</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Playground templates for common scenarios
export const playgroundTemplates = {
  basicShuriken: `import { Shuriken } from 'ninja-agents';
import { z } from 'zod';

// Create a simple calculator shuriken
const calculatorShuriken = new Shuriken(
  'calculate',
  'Perform basic math operations',
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

// Test the shuriken
const result = await calculatorShuriken.execute({
  operation: 'add',
  a: 5,
  b: 3
});

console.log('Result:', result);`,

  basicKata: `import { Kata, KataRuntime } from 'ninja-agents';

// Assuming you have a runtime configured
const kata = new Kata(runtime, {
  model: 'gpt-4o-mini',
  title: 'Math Tutor',
  description: 'Help students with math problems',
  parameters: {
    temperature: 0.7,
    max_tokens: 500
  }
});

// Execute the kata
const response = await kata.execute('Explain how to solve 2x + 5 = 15');
console.log('Kata response:', response);`,

  basicShinobi: `import { Shinobi } from 'ninja-agents';

// Create a math expert shinobi
const mathExpert = new Shinobi(runtime, {
  role: 'Mathematics Expert',
  description: 'Expert mathematician and tutor',
  backstory: 'PhD in Mathematics with 20 years of teaching experience',
  katas: [{
    model: 'gpt-4o-mini',
    title: 'Problem Solver',
    description: 'Solve mathematical problems step by step'
  }]
});

// Execute complex problem solving
const result = await mathExpert.execute(
  'A train travels 120 miles in 2 hours. How fast is it going in km/h?'
);

console.log('Solution:', result);`
};