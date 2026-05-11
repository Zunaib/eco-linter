# @eco-linter/badge

SVG badge generator for [@eco-linter/cli](https://www.npmjs.com/package/@eco-linter/cli) Carbon Scores.

This is an internal package used by `@eco-linter/cli`. For end-user docs see the [@eco-linter/cli package](https://www.npmjs.com/package/@eco-linter/cli).

## Usage

```ts
import { generateBadge } from '@eco-linter/badge';

const svg = generateBadge({ score: 82, grade: 'B' });
```

Configure badge output via `eco-linter.config.ts`:

```ts
export default defineConfig({
  badge: {
    outputPath: './badges/eco-score.svg',
    autoUpdateReadme: true,
  },
});
```

## License

MIT
