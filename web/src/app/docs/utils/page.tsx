import DocsLayout from '../layout';

export default function Utils() {
  return (
    <DocsLayout>
      <h1>Utils</h1>
      <p>The <b>Utils</b> module provides helper functions and utilities used throughout the orchestration, Shinobi, Kata, and Shuriken modules. These utilities support logging, validation, data transformation, and more.</p>
      <h2>Common Utilities</h2>
      <ul>
        <li>Logging helpers</li>
        <li>Data transformation</li>
        <li>Validation and type checking</li>
      </ul>
      <h2>Example</h2>
      <pre>{`import { someUtil } from '../utils';
// someUtil(...)
`}</pre>
    </DocsLayout>
  );
}
