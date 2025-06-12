import DocsLayout from '../layout';

export default function Overview() {
  return (
    <DocsLayout>
      <h1>Project Overview</h1>
      <p><b>Ninja-UI</b> is a comprehensive TypeScript package for advanced AI crew orchestration. It demonstrates modular, persona-driven orchestration patterns with specialized agents and workflows, inspired by ninja concepts.</p>
      <ul>
        <li><b>Shinobi</b>: Persona-driven orchestrators that manage multiple specialized agents</li>
        <li><b>Kata</b>: Specialized AI agents focused on specific tasks and workflows</li>
        <li><b>Shuriken</b>: Specific capabilities/functions that agents can invoke</li>
        <li><b>Orchestration</b>: High-level systems that coordinate multiple Shinobi for complex workflows</li>
      </ul>
      <h2>Key Features</h2>
      <ul>
        <li>Modular, reusable AI agent definitions</li>
        <li>Collaborative multi-agent workflows</li>
        <li>Token usage tracking and cost estimation</li>
        <li>Persistent logging with Supabase integration</li>
        <li>Comprehensive testing suite</li>
      </ul>
      <h2>Architecture</h2>
      <p>The architecture is centered around orchestrators (Shinobi), workflows (Kata), and capabilities (Shuriken), with orchestration layers for complex agent collaboration.</p>
    </DocsLayout>
  );
}
