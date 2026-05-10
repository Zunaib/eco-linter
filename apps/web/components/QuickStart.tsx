'use client';

import { useState } from 'react';

const tabs = [
  {
    id: 'cli',
    label: 'CLI',
    language: 'bash',
    code: `# Analyse current project
npx eco-linter

# Generate HTML report
npx eco-linter --format html

# Fail CI if score drops below 70
npx eco-linter --min-score 70

# GitHub Actions annotations
npx eco-linter --format github-annotations`,
  },
  {
    id: 'eslint',
    label: 'ESLint Plugin',
    language: 'typescript',
    code: `// eslint.config.ts
import ecoLinter from '@eco-linter/eslint-plugin';

export default [
  {
    plugins: { eco: ecoLinter },
    rules: {
      'eco/no-heavy-moment':            'error',
      'eco/no-lodash-full-import':      'error',
      'eco/no-nested-array-iterations': 'warn',
      'eco/no-barrel-reexports':        'warn',
      'eco/no-exponential-recursion':   'error',
    },
  },
];`,
  },
  {
    id: 'config',
    label: 'Config File',
    language: 'typescript',
    code: `// eco-linter.config.ts
import { defineConfig } from 'eco-linter';

export default defineConfig({
  include: ['src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['**/*.test.ts', 'node_modules'],

  // Regional carbon intensity
  region: 'eu-west', // 'us-east' | 'us-west' | 'ap-southeast' | number

  rules: {
    'eco/no-heavy-moment':   'error',
    'eco/no-barrel-reexports': 'off',
  },

  badge: {
    outputPath: './badges/eco-score.svg',
    autoUpdateReadme: true,
  },

  minScore: 70,
  reporter: 'html',
});`,
  },
  {
    id: 'ci',
    label: 'GitHub Actions',
    language: 'yaml',
    code: `# .github/workflows/eco-linter.yml
name: Carbon Score

on: [push, pull_request]

jobs:
  eco-linter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run eco-linter
        run: |
          npx eco-linter \\
            --format github-annotations \\
            --min-score 70`,
  },
];

export default function QuickStart() {
  const [active, setActive] = useState('cli');
  const tab = tabs.find(t => t.id === active) ?? tabs[0]!;

  return (
    <section id="quick-start" className="py-24 px-6 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-green-400 text-sm font-semibold tracking-widest uppercase mb-3">Quick Start</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Up and running in seconds</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Works as a standalone CLI, an ESLint plugin for inline IDE feedback, or programmatically in your own tooling.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-zinc-800 px-4 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  active === t.id
                    ? 'text-zinc-100 border-green-500'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Code */}
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed text-zinc-300">
              <code>{tab.code}</code>
            </pre>
          </div>
        </div>

        {/* Install snippet */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-semibold">Install CLI</p>
            <code className="text-sm text-green-400 font-mono">npm install -D eco-linter</code>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-semibold">Install ESLint Plugin</p>
            <code className="text-sm text-green-400 font-mono">npm install -D @eco-linter/eslint-plugin</code>
          </div>
        </div>
      </div>
    </section>
  );
}
