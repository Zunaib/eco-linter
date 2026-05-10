# @eco-linter/eslint-plugin

ESLint plugin for [eco-linter](https://www.npmjs.com/package/eco-linter) — inline IDE warnings for energy-inefficient code patterns in TypeScript and JavaScript.

## Installation

```bash
npm install -D @eco-linter/eslint-plugin
```

## Setup

```ts
// eslint.config.ts
import ecoLinter from '@eco-linter/eslint-plugin';

export default [
  {
    plugins: { eco: ecoLinter },
    rules: {
      'eco/no-heavy-moment':              'error',
      'eco/no-lodash-full-import':        'error',
      'eco/no-nested-array-iterations':   'warn',
      'eco/no-repeated-dom-queries':      'warn',
      'eco/no-polling-setinterval':       'warn',
      'eco/no-barrel-reexports':          'warn',
      'eco/no-side-effect-imports':       'warn',
      'eco/no-exponential-recursion':     'error',
      'eco/prefer-map-over-linear-find':  'warn',
      'eco/prefer-named-exports':         'info',
      'eco/prefer-for-of-over-foreach':   'info',
      'eco/prefer-native-over-polyfill':  'warn',
      'eco/prefer-date-fns-esm':          'info',
      'eco/no-barrel-reexports':          'warn',
    },
  },
];
```

## Rules

### Loop Efficiency

| Rule | Default | Description |
|------|---------|-------------|
| `eco/no-nested-array-iterations` | error | Nested `.forEach`/`.map`/`.filter` calls — O(n²) or worse |
| `eco/no-repeated-dom-queries` | warn | DOM query inside a loop body |
| `eco/no-polling-setinterval` | warn | `setInterval` with interval < 500 ms |
| `eco/prefer-for-of-over-foreach` | info | `for…of` saves a callback allocation over `.forEach` |

### Dependency Health

| Rule | Default | Description |
|------|---------|-------------|
| `eco/no-heavy-moment` | error | `import moment` — use date-fns or native `Intl` instead |
| `eco/no-lodash-full-import` | error | `import _ from 'lodash'` — use named imports or lodash-es |
| `eco/prefer-native-over-polyfill` | warn | Polyfills for APIs natively supported in ES2022+ |
| `eco/prefer-date-fns-esm` | info | `date-fns` CommonJS import — use ESM for tree-shaking |

### Tree-Shakability

| Rule | Default | Description |
|------|---------|-------------|
| `eco/no-side-effect-imports` | warn | `import 'module'` with no bindings |
| `eco/no-barrel-reexports` | warn | `export * from '…'` in index files defeats tree-shaking |
| `eco/prefer-named-exports` | info | Default exports in library code prevent dead-code elimination |

### Algorithmic Complexity

| Rule | Default | Description |
|------|---------|-------------|
| `eco/no-exponential-recursion` | error | Recursive function without memoization |
| `eco/prefer-map-over-linear-find` | warn | `.find()` inside a loop — use a Map for O(1) lookup |

## License

MIT
