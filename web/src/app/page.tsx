import Link from "next/link";
import { MessageSquare, Book, Code, Sparkles, ArrowRight, Github, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ninja Agents</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Crew Orchestration</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/chat" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Try Demo
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Build Powerful
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> AI Crews</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A comprehensive TypeScript framework for building sophisticated AI crew orchestration systems. 
            Create specialized agents that work together to solve complex problems.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/chat"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              <MessageSquare size={20} />
              Try Interactive Demo
              <ArrowRight size={16} />
            </Link>
            <Link 
              href="/docs"
              className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              <Book size={20} />
              View Documentation
            </Link>
          </div>

          {/* Demo Links Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Explore Different Orchestration Patterns
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link 
                href="/chat"
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Single Shinobi</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Experience a single AI agent with multiple specialized skills working together to solve complex tasks.
                </p>
              </Link>

              <Link 
                href="/clan-demo"
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Clan Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  See multiple AI specialists collaborate simultaneously, each bringing their unique expertise to the analysis.
                </p>
              </Link>

              <Link 
                href="/dojo-demo"
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg w-fit mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                  <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Dojo Workflows</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore structured sequential workflows where agents execute in a defined order for comprehensive analysis.
                </p>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mb-4">
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Modular Architecture</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Build with Shurikens (tools), Katas (skills), and Shinobi (agents) for maximum reusability and clarity.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit mb-4">
                <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Persona-Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create AI agents with rich personalities, backstories, and specialized expertise for more engaging interactions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Multi-Agent Orchestration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Coordinate multiple AI agents to work together, combining their expertise for comprehensive solutions.
              </p>
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-gray-900 rounded-xl p-8 text-left max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-400 ml-4 text-sm">Quick Start Example</span>
            </div>
            <pre className="text-gray-300 text-sm overflow-x-auto">
{`import { Shinobi, Shuriken, KataRuntime } from 'ninja-agents';

// Create a research assistant
const researcher = new Shinobi(runtime, {
  role: 'Research Director',
  description: 'Expert researcher and analyst',
  backstory: '20+ years in academic research...',
  katas: [{
    model: 'gpt-4o-mini',
    title: 'Research Analyst',
    description: 'Conduct comprehensive research'
  }]
});

// Execute complex research tasks
const result = await researcher.execute(
  'Analyze the latest trends in AI and their business impact'
);`}
            </pre>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Ninja Agents SDK</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/chat" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Demo
              </Link>
              <Link href="/clan-demo" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Clan Demo
              </Link>
              <Link href="/dojo-demo" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Dojo Demo
              </Link>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 Ninja Agents. Built with TypeScript, OpenAI, and modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}