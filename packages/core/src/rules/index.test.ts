import { describe, it, expect } from 'vitest';
import { analyzeFile } from '../analyzer.js';
import { DEFAULT_CONFIG } from '../types.js';

describe('eco/no-heavy-moment', () => {
  it('reports moment import', () => {
    const result = analyzeFile('test.ts', `import moment from 'moment';`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-heavy-moment')).toBe(true);
  });

  it('does not report date-fns import', () => {
    const result = analyzeFile('test.ts', `import { format } from 'date-fns';`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-heavy-moment')).toBe(false);
  });
});

describe('eco/no-lodash-full-import', () => {
  it('reports full lodash import', () => {
    const result = analyzeFile('test.ts', `import _ from 'lodash';`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-lodash-full-import')).toBe(true);
  });

  it('does not report per-method lodash import', () => {
    const result = analyzeFile('test.ts', `import merge from 'lodash/merge';`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-lodash-full-import')).toBe(false);
  });
});

describe('eco/no-side-effect-imports', () => {
  it('reports bare side-effect import', () => {
    const result = analyzeFile('test.ts', `import 'some-lib';`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-side-effect-imports')).toBe(true);
  });

  it('does not report named imports', () => {
    const result = analyzeFile('test.ts', `import { foo } from 'some-lib';`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-side-effect-imports')).toBe(false);
  });

  it('does not report CSS imports', () => {
    const result = analyzeFile('test.ts', `import './styles.css';`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-side-effect-imports')).toBe(false);
  });
});

describe('eco/no-nested-array-iterations', () => {
  it('reports nested forEach', () => {
    const code = `items.forEach(item => { item.subitems.forEach(sub => console.log(sub)); });`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-nested-array-iterations')).toBe(true);
  });
});

describe('eco/no-polling-setinterval', () => {
  it('reports setInterval with short interval', () => {
    const result = analyzeFile('test.ts', `setInterval(() => {}, 100);`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-polling-setinterval')).toBe(true);
  });

  it('does not report setInterval with long interval', () => {
    const result = analyzeFile('test.ts', `setInterval(() => {}, 1000);`, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-polling-setinterval')).toBe(false);
  });
});

describe('eco/no-exponential-recursion', () => {
  it('reports fibonacci without memoization', () => {
    const code = `function fib(n) { return fib(n - 1) + fib(n - 2); }`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-exponential-recursion')).toBe(true);
  });
});

describe('Carbon Score', () => {
  it('returns 100 for clean code', () => {
    const result = analyzeFile('test.ts', `const x = 1;`, DEFAULT_CONFIG);
    expect(result.score).toBe(100);
  });

  it('reduces score for violations', () => {
    const result = analyzeFile('test.ts', `import _ from 'lodash'; import moment from 'moment';`, DEFAULT_CONFIG);
    expect(result.score).toBeLessThan(100);
  });
});
