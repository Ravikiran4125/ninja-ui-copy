import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Markdown from 'react-markdown';
import DocsLayout from '../layout';

// Map slugs to actual file paths
const DOCS_MAP: Record<string, string> = {
  'intro': 'docs/intro.md',
  'getting-started/installation': 'docs/getting-started/installation.md',
  'getting-started/quick-start': 'docs/getting-started/quick-start.md',
  'concepts/overview': 'docs/concepts/overview.md',
  'concepts/shuriken': 'docs/concepts/shuriken.md',
  // API/package docs
  'packages/shinobi': 'src/core/shinobi.ts',
  'packages/shuriken': 'src/core/shuriken.ts',
  'packages/kata': 'src/core/kata.ts',
  'packages/orchestration': 'src/orchestrations/index.ts',
};

export async function generateStaticParams() {
  // Predefine all valid routes for static generation
  return Object.keys(DOCS_MAP).map(slug => ({ slug: slug.split('/') }));
}

async function getDocContent(slugArr: string[]) {
  const slug = slugArr.join('/');
  const filePath = DOCS_MAP[slug];
  if (!filePath) return null;
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) return null;
  const raw = fs.readFileSync(absPath, 'utf8');
  if (filePath.endsWith('.md')) {
    const { content } = matter(raw);
    return { content };
  }
  if (filePath.endsWith('.ts')) {
    return { content: '```typescript\n' + raw + '\n```' };
  }
  return null;
}

interface DocPageProps {
  params: {
    slug: string[];
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const doc = await getDocContent(params.slug);
  return (
    <DocsLayout>
      {doc ? <Markdown>{doc.content}</Markdown> : <div style={{padding:32}}><h2>Documentation not found</h2><p>The requested documentation page does not exist.</p></div>}
    </DocsLayout>
  );
}