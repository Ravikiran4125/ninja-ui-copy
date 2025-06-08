/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'concepts/overview',
        'concepts/shinobi',
        'concepts/kata',
        'concepts/shuriken',
        'concepts/orchestration',
        'concepts/memory-logging',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/creating-shurikens',
        'guides/building-katas',
        'guides/designing-shinobi',
        'guides/orchestration-patterns',
        'guides/testing-strategies',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/basic-usage',
        'examples/travel-planning',
        'examples/research-analysis',
        'examples/digital-consulting',
        'examples/collaborative-workflows',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      items: [
        'advanced/custom-orchestrations',
        'advanced/performance-optimization',
        'advanced/error-handling',
        'advanced/monitoring-analytics',
      ],
    },
  ],
};

export default sidebars;