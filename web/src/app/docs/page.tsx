import fs from 'fs';
import path from 'path';
import React from 'react';
import matter from 'gray-matter';
import Markdown from 'react-markdown';

// Helper to read all markdown files from the original docs directory
function getDocsContent() {
  const docsDir = path.resolve(process.cwd(), '../../docs');
  if (!fs.existsSync(docsDir)) return [];
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
  return files.map(filename => {
    const filePath = path.join(docsDir, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(raw);
    return { filename, content, data };
  });
}

const DocsPage = () => {
  const docs = getDocsContent();
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
      <h1>Documentation</h1>
      {docs.length === 0 && <p>No documentation found.</p>}
      {docs.map(doc => (
        <div key={doc.filename} style={{ marginBottom: 48 }}>
          <h2>{doc.data.title || doc.filename.replace('.md', '')}</h2>
          <Markdown>{doc.content}</Markdown>
        </div>
      ))}
    </div>
  );
};

export default DocsPage;
