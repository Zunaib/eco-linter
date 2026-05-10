# eco-linter

[![Tests](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Zunaib/eco-linter/main/badges/tests.json)](https://github.com/Zunaib/eco-linter/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@eco-linter/cli)](https://www.npmjs.com/package/@eco-linter/cli)
[![License: MIT](https://img.shields.io/npm/l/eco-linter)](https://github.com/Zunaib/eco-linter/blob/main/LICENSE)

**Carbon-aware static analysis for TypeScript and JavaScript.**

eco-linter analyses your codebase across four energy-efficiency pillars and produces a single **Carbon Score** from 0–100 — along with an estimated CO₂e per build. Run it as a CLI, plug it into ESLint for inline IDE feedback, or gate your CI pipeline with a minimum score.

---

## Features

- **Carbon Score (0–100)** with letter grade (F → A+) for every build
- **CO₂e estimate per build** based on code complexity and regional grid intensity
- **14 built-in rules** across loop efficiency, dependency health, tree-shakability, and algorithmic complexity
- **ESLint plugin** — inline warnings inside VS Code, WebStorm, and any ESLint-aware editor
- **Six reporter formats** — pretty terminal, HTML, JSON, SARIF, GitHub Actions annotations, Markdown
- **CI integration** — fail the build when score drops below a threshold
- **SVG badge** — auto-generate and embed a score badge in your README
- **Zero config** — works out of the box; add `eco-linter.config.ts` to customise

---

## Quick Start

```bash
# Analyse current project (pretty terminal output)
npx eco-linter

# Generate an HTML report
npx eco-linter --format html

# Fail CI if score drops below 70
npx eco-linter --min-score 70

# GitHub Actions annotations
npx eco-linter --format github-annotations
```

---

## Installation

### CLI

```bash
npm install -D @eco-linter/cli
```

### ESLint Plugin

```bash
npm install -D @eco-linter/eslint-plugin
```

---

## Carbon Score

Every project receives a score from 0–100 and a corresponding grade:

| Grade | Range  | Label     | Description                       |
|-------|--------|-----------|-----------------------------------|
| A+    | 95–100 | Exemplary | Industry best practice            |
| A     | 85–94  | Excellent | Minor improvements possible       |
| B     | 70–84  | Good      | Some inefficiencies to address    |
| C     | 55–69  | Fair      | Several high-impact issues        |
| D     | 40–54  | Poor      | Significant work needed           |
| F     | 0–39   | Critical  | Major inefficiencies throughout   |

The score is composed of four weighted pillars:

| Pillar                  | Weight | What it measures                                                   |
|-------------------------|--------|--------------------------------------------------------------------|
| Dependency Health       | 35%    | Heavy libraries, full lodash imports, unnecessary polyfills        |
| Loop Efficiency         | 30%    | Nested iterations, DOM queries in loops, tight polling intervals   |
| Tree-Shakability        | 25%    | Side-effect imports, barrel re-exports, default exports in libs    |
| Algorithmic Complexity  | 10%    | Exponential recursion, linear finds inside loops                   |

---

## CO₂e Estimates

The `estimatedCO2ePerBuild` figure uses a simplified model:

- **Instruction weight proxies** — cyclomatic complexity and loop depth estimates
- **Dependency bundle size** — heavier bundles = more bytes transferred and parsed
- **Regional carbon intensity** — configure your grid's gCO₂/kWh via the `region` option

This is an _estimate_, not a measurement. It's intended to make energy cost visible and comparable across builds — not to replace tooling like Cloud Carbon Footprint.

---

## ESLint Plugin

```ts
// eslint.config.ts
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
];
```

---

## Configuration

Create `eco-linter.config.ts` (or `.eco-linterrc.json`) in your project root:

```ts
// eco-linter.config.ts
import { defineConfig } from 'eco-linter';

export default defineConfig({
  include: ['src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['**/*.test.ts', 'node_modules'],

  // Regional carbon intensity
  // 'us-east' | 'us-west' | 'eu-west' | 'ap-southeast' | number (gCO₂/kWh)
  region: 'eu-west',

  rules: {
    'eco/no-heavy-moment':    'error',
    'eco/no-barrel-reexports': 'off',
  },

  badge: {
    outputPath: './badges/eco-score.svg',
    autoUpdateReadme: true,
  },

  minScore: 70,
  reporter: 'html',
});
```

### Config options

| Option            | Type                                      | Default      | Description                                     |
|-------------------|-------------------------------------------|--------------|-------------------------------------------------|
| `include`         | `string[]`                                | `['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']` | Glob patterns to analyse |
| `exclude`         | `string[]`                                | `['node_modules', 'dist', '.next']` | Glob patterns to skip    |
| `region`          | `'us-east'│'us-west'│'eu-west'│'ap-southeast'│number` | `'us-east'` | Grid carbon intensity    |
| `rules`           | `Record<string, 'error'│'warn'│'info'│'off'>` | see defaults | Rule severity overrides  |
| `minScore`        | `number`                                  | `undefined`  | Exit code 1 if score < minScore                 |
| `reporter`        | `'pretty'│'json'│'sarif'│'github-annotations'│'markdown'│'html'` | `'pretty'` | Output format |
| `badge.outputPath`| `string`                                  | `undefined`  | Write SVG badge to this path                    |
| `badge.autoUpdateReadme` | `boolean`                        | `false`      | Inject badge into README.md automatically       |

---

## CLI Reference

```
npx eco-linter [options]

Options:
  --format, -f    Output format: pretty | json | sarif | github-annotations | markdown | html
  --output, -o    Write output to file instead of stdout
  --min-score     Exit with code 1 if Carbon Score < N
  --cwd           Working directory (default: process.cwd())
  --config        Path to config file
  --help, -h      Show help
```

---

## Rules

### Loop Efficiency

| Rule | Severity | Description |
|------|----------|-------------|
| `eco/no-nested-array-iterations` | error | Nested `.forEach`/`.map`/`.filter` calls — O(n²) or worse |
| `eco/no-repeated-dom-queries` | warn | DOM query inside a loop body |
| `eco/no-polling-setinterval` | warn | `setInterval` with interval < 500 ms |
| `eco/prefer-for-of-over-foreach` | info | `Array.forEach` where `for…of` saves a callback allocation |

### Dependency Health

| Rule | Severity | Description |
|------|----------|-------------|
| `eco/no-heavy-moment` | error | `import moment` — use date-fns or native `Intl` instead |
| `eco/no-lodash-full-import` | error | `import _ from 'lodash'` — use named imports or lodash-es |
| `eco/prefer-native-over-polyfill` | warn | Polyfills for APIs natively supported in ES2022+ |
| `eco/prefer-date-fns-esm` | info | `date-fns` CommonJS import — use ESM for tree-shaking |

### Tree-Shakability

| Rule | Severity | Description |
|------|----------|-------------|
| `eco/no-side-effect-imports` | warn | `import 'module'` with no bindings |
| `eco/no-barrel-reexports` | warn | `export * from '…'` in index files defeats tree-shaking |
| `eco/prefer-named-exports` | info | Default exports in library code prevent dead-code elimination |

### Algorithmic Complexity

| Rule | Severity | Description |
|------|----------|-------------|
| `eco/no-exponential-recursion` | error | Recursive function without memoization |
| `eco/prefer-map-over-linear-find` | warn | `.find()` inside a loop — use a Map for O(1) lookup |

---

## CI / GitHub Actions

```yaml
# .github/workflows/eco-linter.yml
name: Carbon Score

on: [push, pull_request]

jobs:
  eco-linter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run eco-linter
        run: |
          npx eco-linter \
            --format github-annotations \
            --min-score 70
```

Violations appear as inline PR annotations. The job fails if the Carbon Score drops below 70.

---

## Badge

Add a Carbon Score badge to your README:

```ts
// eco-linter.config.ts
export default defineConfig({
  badge: {
    outputPath: './badges/eco-score.svg',
    autoUpdateReadme: true,
  },
});
```

Or generate it manually:

```bash
npx eco-linter-badge --score 82 --output ./badges/eco-score.svg
```

Then embed it:

```md
![Carbon Score](./badges/eco-score.svg)
```

---

## Reporters

| Reporter | Flag | Description |
|----------|------|-------------|
| `pretty` | `--format pretty` | Coloured terminal output with grade and pillar breakdown |
| `html` | `--format html` | Self-contained `eco-report.html` with collapsible file cards |
| `json` | `--format json` | Machine-readable full result object |
| `sarif` | `--format sarif` | SARIF 2.1 for GitHub Code Scanning |
| `github-annotations` | `--format github-annotations` | `::error` / `::warning` workflow commands |
| `markdown` | `--format markdown` | Markdown summary table for PR comments |

---

## Packages

| Package | Description |
|---------|-------------|
| [`@eco-linter/cli`](https://www.npmjs.com/package/@eco-linter/cli) | CLI and programmatic API |
| [`@eco-linter/eslint-plugin`](https://www.npmjs.com/package/@eco-linter/eslint-plugin) | ESLint plugin with all 14 rules |
| `@eco-linter/core` | Analysis engine (internal) |
| `@eco-linter/badge` | SVG badge generator (internal) |

---

## Programmatic API

```ts
import { analyzeProject } from 'eco-linter';

const result = await analyzeProject({
  cwd: '/path/to/project',
  region: 'eu-west',
});

console.log(result.score);           // 82
console.log(result.grade);           // 'B'
console.log(result.estimatedCO2ePerBuild); // 0.4
console.log(result.violations);     // Violation[]
```

---

## License

MIT © eco-linter contributors
