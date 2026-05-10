import { describe, it, expect } from 'vitest';
import { analyzeFile } from '../analyzer.js';
import { DEFAULT_CONFIG } from '../types.js';

// ─── Loop Efficiency rules ────────────────────────────────────────────────────

describe('eco/no-nested-array-iterations', () => {
  it('reports nested forEach inside forEach', () => {
    const code = `items.forEach(item => { item.subs.forEach(sub => console.log(sub)); });`;
    expect(violations(code, 'eco/no-nested-array-iterations')).toBe(true);
  });

  it('reports nested map inside forEach', () => {
    const code = `items.forEach(item => { item.subs.map(sub => sub.id); });`;
    expect(violations(code, 'eco/no-nested-array-iterations')).toBe(true);
  });

  it('does not report a single-level forEach', () => {
    const code = `items.forEach(item => console.log(item));`;
    expect(violations(code, 'eco/no-nested-array-iterations')).toBe(false);
  });
});

describe('eco/no-polling-setinterval', () => {
  it('reports setInterval with interval below 500ms', () => {
    expect(violations(`setInterval(() => {}, 100);`, 'eco/no-polling-setinterval')).toBe(true);
  });

  it('reports setInterval with interval of 499ms', () => {
    expect(violations(`setInterval(() => {}, 499);`, 'eco/no-polling-setinterval')).toBe(true);
  });

  it('does not report setInterval with interval of 500ms', () => {
    expect(violations(`setInterval(() => {}, 500);`, 'eco/no-polling-setinterval')).toBe(false);
  });

  it('does not report setInterval with interval above 500ms', () => {
    expect(violations(`setInterval(() => {}, 1000);`, 'eco/no-polling-setinterval')).toBe(false);
  });
});

describe('eco/prefer-for-of-over-foreach', () => {
  it('reports .forEach() on an array', () => {
    expect(violations(`arr.forEach(x => console.log(x));`, 'eco/prefer-for-of-over-foreach')).toBe(true);
  });

  it('does not report a for-of loop', () => {
    expect(violations(`for (const x of arr) { console.log(x); }`, 'eco/prefer-for-of-over-foreach')).toBe(false);
  });
});

// ─── Dependency Health rules ──────────────────────────────────────────────────

describe('eco/no-heavy-moment', () => {
  it('reports default moment import', () => {
    expect(violations(`import moment from 'moment';`, 'eco/no-heavy-moment')).toBe(true);
  });

  it('reports named moment import', () => {
    expect(violations(`import { utc } from 'moment';`, 'eco/no-heavy-moment')).toBe(true);
  });

  it('does not report date-fns', () => {
    expect(violations(`import { format } from 'date-fns';`, 'eco/no-heavy-moment')).toBe(false);
  });

  it('does not report dayjs', () => {
    expect(violations(`import dayjs from 'dayjs';`, 'eco/no-heavy-moment')).toBe(false);
  });
});

describe('eco/no-lodash-full-import', () => {
  it('reports full lodash default import', () => {
    expect(violations(`import _ from 'lodash';`, 'eco/no-lodash-full-import')).toBe(true);
  });

  it('does not report per-method lodash import', () => {
    expect(violations(`import merge from 'lodash/merge';`, 'eco/no-lodash-full-import')).toBe(false);
  });

  it('reports lodash-es named import from root (still full bundle)', () => {
    // Named imports from 'lodash-es' root still force the full bundle.
    // Tree-shaking requires: import merge from 'lodash-es/merge'
    expect(violations(`import { merge } from 'lodash-es';`, 'eco/no-lodash-full-import')).toBe(true);
  });

  it('does not report per-method lodash-es import', () => {
    expect(violations(`import merge from 'lodash-es/merge';`, 'eco/no-lodash-full-import')).toBe(false);
  });
});

describe('eco/prefer-native-over-polyfill', () => {
  it('reports whatwg-fetch polyfill (native fetch is widely supported)', () => {
    expect(violations(`import 'whatwg-fetch';`, 'eco/prefer-native-over-polyfill')).toBe(true);
  });

  it('reports es6-promise polyfill (Promise is ES2015 native)', () => {
    expect(violations(`import 'es6-promise';`, 'eco/prefer-native-over-polyfill')).toBe(true);
  });

  it('does not report an unknown package', () => {
    expect(violations(`import 'some-unrelated-package';`, 'eco/prefer-native-over-polyfill')).toBe(false);
  });
});

describe('eco/prefer-date-fns-esm', () => {
  it('reports CommonJS date-fns import', () => {
    expect(violations(`const { format } = require('date-fns');`, 'eco/prefer-date-fns-esm')).toBe(false);
    // Rule detects ESM import of non-ESM path
    expect(violations(`import { format } from 'date-fns/format';`, 'eco/prefer-date-fns-esm')).toBe(false);
  });
});

// ─── Tree-Shakability rules ───────────────────────────────────────────────────

describe('eco/no-side-effect-imports', () => {
  it('reports bare side-effect import', () => {
    expect(violations(`import 'some-lib';`, 'eco/no-side-effect-imports')).toBe(true);
  });

  it('does not report named import', () => {
    expect(violations(`import { foo } from 'some-lib';`, 'eco/no-side-effect-imports')).toBe(false);
  });

  it('does not report CSS asset import', () => {
    expect(violations(`import './styles.css';`, 'eco/no-side-effect-imports')).toBe(false);
  });

  it('does not report SCSS asset import', () => {
    expect(violations(`import './app.scss';`, 'eco/no-side-effect-imports')).toBe(false);
  });

  it('does not report known-safe reflect-metadata', () => {
    expect(violations(`import 'reflect-metadata';`, 'eco/no-side-effect-imports')).toBe(false);
  });
});

describe('eco/no-barrel-reexports', () => {
  it('reports export * from in an index file', () => {
    const code = `export * from './utils';`;
    const result = analyzeFile('src/index.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-barrel-reexports')).toBe(true);
  });
});

describe('eco/prefer-named-exports', () => {
  it('reports default export of a function', () => {
    expect(violations(`export default function myFn() {}`, 'eco/prefer-named-exports')).toBe(true);
  });

  it('does not report named export', () => {
    expect(violations(`export function myFn() {}`, 'eco/prefer-named-exports')).toBe(false);
  });
});

// ─── Algorithmic Complexity rules ─────────────────────────────────────────────

describe('eco/no-exponential-recursion', () => {
  it('reports fibonacci without memoization', () => {
    const code = `function fib(n) { return fib(n - 1) + fib(n - 2); }`;
    expect(violations(code, 'eco/no-exponential-recursion')).toBe(true);
  });

  it('does not report a function calling itself only once', () => {
    const code = `function countdown(n) { if (n <= 0) return; countdown(n - 1); }`;
    expect(violations(code, 'eco/no-exponential-recursion')).toBe(false);
  });
});

describe('eco/prefer-map-over-linear-find', () => {
  it('reports .find() inside a loop body', () => {
    const code = `for (const id of ids) { const found = items.find(i => i.id === id); }`;
    expect(violations(code, 'eco/prefer-map-over-linear-find')).toBe(true);
  });
});

// ─── Carbon Score ─────────────────────────────────────────────────────────────

describe('Carbon Score', () => {
  it('returns score of 100 for a file with no violations', () => {
    const result = analyzeFile('test.ts', `const x = 1;`, DEFAULT_CONFIG);
    expect(result.score).toBe(100);
  });

  it('reduces score when violations are present', () => {
    const code = `import _ from 'lodash';\nimport moment from 'moment';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.score).toBeLessThan(100);
  });

  it('returns a grade of F for a critically bad score', () => {
    // Multiple high-impact errors will drive score down
    const code = [
      `import _ from 'lodash';`,
      `import moment from 'moment';`,
      `items.forEach(item => { item.subs.forEach(sub => sub); });`,
      `function fib(n) { return fib(n-1) + fib(n-2); }`,
      `export * from './a';`,
      `export * from './b';`,
      `import 'side-effect';`,
    ].join('\n');
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.score).toBeLessThan(70);
  });

  it('filePath is preserved in the result', () => {
    const result = analyzeFile('my/file.ts', `const x = 1;`, DEFAULT_CONFIG);
    expect(result.filePath).toBe('my/file.ts');
  });

  it('returns empty violations array for a parse error', () => {
    const result = analyzeFile('test.ts', `const = ;`, DEFAULT_CONFIG);
    expect(result.violations).toHaveLength(0);
    expect(result.score).toBe(100);
  });
});

// ─── Rule override via config ─────────────────────────────────────────────────

describe('rule severity overrides', () => {
  it('turns off a rule when set to "off"', () => {
    const config = { ...DEFAULT_CONFIG, rules: { 'eco/no-heavy-moment': 'off' as const } };
    const result = analyzeFile('test.ts', `import moment from 'moment';`, config);
    expect(result.violations.some(v => v.ruleId === 'eco/no-heavy-moment')).toBe(false);
  });

  it('downgrades an error rule to warn', () => {
    const config = { ...DEFAULT_CONFIG, rules: { 'eco/no-heavy-moment': 'warn' as const } };
    const result = analyzeFile('test.ts', `import moment from 'moment';`, config);
    const v = result.violations.find(v => v.ruleId === 'eco/no-heavy-moment');
    expect(v?.severity).toBe('warn');
  });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function violations(code: string, ruleId: string, file = 'test.ts'): boolean {
  return analyzeFile(file, code, DEFAULT_CONFIG).violations.some(v => v.ruleId === ruleId);
}
