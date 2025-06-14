import DocsLayout from '../layout';

export default function Shuriken() {
  return (
    <DocsLayout>
      <h1>Shuriken</h1>
      <p><b>Shuriken</b> are specific capabilities or functions that can be invoked by agents (Kata) or orchestrators (Shinobi). Each Shuriken represents a reusable skill or API call.</p>
      <h2>Key Responsibilities</h2>
      <ul>
        <li>Encapsulates a single capability or function</li>
        <li>Reusable across different agents and workflows</li>
        <li>Can be invoked by Shinobi or Kata</li>
      </ul>
      <h2>Example Usage</h2>
      <pre>{`import { Shuriken } from '../core/shuriken';
const capability = new Shuriken(/* config */);
// capability.invoke(...)
`}</pre>
    </DocsLayout>
  );
}
