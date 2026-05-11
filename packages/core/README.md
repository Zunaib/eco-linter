# @eco-linter/core

Analysis engine for [@eco-linter/cli](https://www.npmjs.com/package/@eco-linter/cli) — rules, scoring, and reporters.

This is an internal package consumed by `@eco-linter/cli` and `@eco-linter/eslint-plugin`. For end-user docs see the [@eco-linter/cli package](https://www.npmjs.com/package/@eco-linter/cli).

## Programmatic API

```ts
import { analyzeProject } from '@eco-linter/core';

const result = await analyzeProject({
  cwd: '/path/to/project',
  region: 'eu-west',
});

console.log(result.score);                // 82
console.log(result.grade);               // 'B'
console.log(result.estimatedCO2ePerBuild); // 0.4
console.log(result.violations);          // Violation[]
```

## License

MIT
