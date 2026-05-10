# @eco-linter/core

Analysis engine for [eco-linter](https://www.npmjs.com/package/eco-linter) — rules, scoring, and reporters.

This is an internal package consumed by `eco-linter` (CLI) and `@eco-linter/eslint-plugin`. For end-user docs see the [eco-linter package](https://www.npmjs.com/package/eco-linter).

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
