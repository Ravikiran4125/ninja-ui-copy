import { z } from 'zod';
import { Shuriken } from '../../core/shuriken.js';

const webSearchSchema = z.object({
  query: z.string().describe('The search query to look up'),
  maxResults: z.number().optional().describe('Maximum number of results to return (default: 5)')
});

async function webSearchImplementation(params: { query: string; maxResults?: number }) {
  // Simulate web search delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const maxResults = params.maxResults || 5;
  
  // Mock search results based on query
  const mockResults = [
    {
      title: `${params.query} - Official Website`,
      url: `https://example.com/${params.query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Official information about ${params.query}. Comprehensive details and latest updates.`,
      relevanceScore: 0.95
    },
    {
      title: `${params.query} Guide and Tutorial`,
      url: `https://guide.example.com/${params.query.toLowerCase()}`,
      snippet: `Complete guide to ${params.query} with step-by-step instructions and best practices.`,
      relevanceScore: 0.88
    },
    {
      title: `${params.query} News and Updates`,
      url: `https://news.example.com/${params.query.toLowerCase()}`,
      snippet: `Latest news and updates about ${params.query}. Stay informed with recent developments.`,
      relevanceScore: 0.82
    },
    {
      title: `${params.query} Community Forum`,
      url: `https://forum.example.com/${params.query.toLowerCase()}`,
      snippet: `Community discussions about ${params.query}. Get help and share experiences.`,
      relevanceScore: 0.75
    },
    {
      title: `${params.query} Research and Analysis`,
      url: `https://research.example.com/${params.query.toLowerCase()}`,
      snippet: `In-depth research and analysis of ${params.query}. Academic and professional insights.`,
      relevanceScore: 0.70
    }
  ];
  
  return {
    query: params.query,
    totalResults: mockResults.length,
    results: mockResults.slice(0, maxResults),
    searchTime: '0.42 seconds',
    timestamp: new Date().toISOString()
  };
}

export const webSearchShuriken = new Shuriken(
  'web_search',
  'Search the web for information on any topic and return relevant results',
  webSearchSchema,
  webSearchImplementation
);