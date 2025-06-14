import DocsLayout from '../layout';

export default function Shinobi() {
  return (
    <DocsLayout>
      <h1>Shinobi</h1>
      <p><b>Shinobi</b> are persona-driven orchestrators that manage specialized agents (Kata) and invoke capabilities (Shuriken). Each Shinobi can embody a unique persona or strategy, enabling flexible and modular workflow design.</p>
      <h2>Key Responsibilities</h2>
      <ul>
        <li>Delegates tasks to Kata agents</li>
        <li>Invokes Shuriken capabilities</li>
        <li>Tracks workflow state and results</li>
      </ul>
      <h2>Example Usage</h2>
      <pre>{`import { Shinobi } from '../core/shinobi';
const ninja = new Shinobi(/* config */);
// ninja.run(...)
`}</pre>
    </DocsLayout>
  );
}
