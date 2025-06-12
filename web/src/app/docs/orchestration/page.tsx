import DocsLayout from '../layout';

export default function Orchestration() {
  return (
    <DocsLayout>
      <h1>Orchestration</h1>
      <p>The orchestration layer coordinates multiple <b>Shinobi</b> and <b>Kata</b> agents to solve complex workflows. Orchestrations are defined in <code>src/orchestrations/</code> and can represent collaborative, hierarchical, or parallel agent execution patterns.</p>
      <h2>How it Works</h2>
      <ul>
        <li>Defines the overall workflow and delegates tasks to Shinobi agents</li>
        <li>Manages data flow, error handling, and result aggregation</li>
        <li>Supports collaborative and multi-step agent workflows</li>
      </ul>
      <h2>Example</h2>
      <pre>{`// Example: CollaborativeOrchestra (src/orchestrations/collaborativeOrchestra.ts)
import { Shinobi } from '../core/shinobi';

// ...orchestration logic here
`}</pre>
    </DocsLayout>
  );
}
