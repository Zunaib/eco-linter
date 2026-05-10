# @eco-linter/badge

SVG badge generator for [eco-linter](https://www.npmjs.com/package/eco-linter) Carbon Scores.

This is an internal package used by the `eco-linter` CLI. For end-user docs see the [eco-linter package](https://www.npmjs.com/package/eco-linter).

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
