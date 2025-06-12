import DocsLayout from '../layout';

export default function Kata() {
  return (
    <DocsLayout>
      <h1>Kata</h1>
      <p><b>Kata</b> are specialized AI agents focused on specific tasks or workflows. Each Kata encapsulates a skill or process, and can be composed into larger workflows by Shinobi orchestrators.</p>
      <h2>Key Responsibilities</h2>
      <ul>
        <li>Performs a specific, well-defined task</li>
        <li>Can be composed with other Kata in workflows</li>
        <li>Returns results to the orchestrator</li>
      </ul>
      <h2>Example Usage</h2>
      <pre>{`import { Kata } from '../core/kata';
const taskAgent = new Kata(/* config */);
// taskAgent.execute(...)
`}</pre>
    </DocsLayout>
  );
}
