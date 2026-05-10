import { describe, it, expect } from 'vitest';
import { analyzeFile } from '../analyzer.js';
import { DEFAULT_CONFIG } from '../types.js';

// ─── Feature 1: Ignore comments ───────────────────────────────────────────────

describe('ignore comments — eco-linter-disable-next-line', () => {
  it('suppresses the specific rule on the very next line', () => {
    const code = `// eco-linter-disable-next-line eco/no-heavy-moment\nimport moment from 'moment';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-heavy-moment')).toBe(false);
  });

  it('does not suppress a different rule on the same line', () => {
    const code = `// eco-linter-disable-next-line eco/no-heavy-moment\nimport _ from 'lodash';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-lodash-full-import')).toBe(true);
  });

  it('does not suppress a rule two lines below', () => {
    const code = `// eco-linter-disable-next-line eco/no-heavy-moment\nconst x = 1;\nimport moment from 'moment';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-heavy-moment')).toBe(true);
  });

  it('suppresses all rules on next line when no rule name given', () => {
    const code = `// eco-linter-disable-next-line\nimport _ from 'lodash';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-lodash-full-import')).toBe(false);
  });
});

describe('ignore comments — eco-linter-disable (file-level)', () => {
  it('suppresses all violations in the file', () => {
    const code = `// eco-linter-disable\nimport _ from 'lodash';\nimport moment from 'moment';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations).toHaveLength(0);
  });

  it('suppresses only the named rule file-wide, leaves others intact', () => {
    const code = `// eco-linter-disable eco/no-heavy-moment\nimport moment from 'moment';\nimport _ from 'lodash';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/no-heavy-moment')).toBe(false);
    expect(result.violations.some(v => v.ruleId === 'eco/no-lodash-full-import')).toBe(true);
  });
});

// ─── Feature 2: sideEffects awareness ────────────────────────────────────────

describe('sideEffects awareness — eco/no-side-effect-imports', () => {
  it('does not flag an import explicitly listed in sideEffects array', () => {
    const config = { ...DEFAULT_CONFIG, sideEffects: ['./src/polyfills.js'] };
    const result = analyzeFile('/project/src/polyfills.js', `import './src/polyfills.js';`, config);
    expect(result.violations.some(v => v.ruleId === 'eco/no-side-effect-imports')).toBe(false);
  });

  it('still flags an import NOT in the sideEffects array', () => {
    const config = { ...DEFAULT_CONFIG, sideEffects: ['./src/polyfills.js'] };
    const result = analyzeFile('test.ts', `import 'some-random-lib';`, config);
    expect(result.violations.some(v => v.ruleId === 'eco/no-side-effect-imports')).toBe(true);
  });

  it('sideEffects: true suppresses all bare import violations', () => {
    const config = { ...DEFAULT_CONFIG, sideEffects: true };
    const result = analyzeFile('test.ts', `import 'some-lib';\nimport 'another-lib';`, config);
    expect(result.violations.some(v => v.ruleId === 'eco/no-side-effect-imports')).toBe(false);
  });

  it('sideEffects: false still flags bare imports', () => {
    const config = { ...DEFAULT_CONFIG, sideEffects: false };
    const result = analyzeFile('test.ts', `import 'some-lib';`, config);
    expect(result.violations.some(v => v.ruleId === 'eco/no-side-effect-imports')).toBe(true);
  });
});

// ─── Feature 5a: eco/react-no-inline-function-props ──────────────────────────

describe('eco/react-no-inline-function-props', () => {
  it('reports an inline arrow function on an onClick prop', () => {
    const code = `const C = () => <Button onClick={() => doThing()} />;`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-inline-function-props')).toBe(true);
  });

  it('reports an inline function expression on an onChange prop', () => {
    const code = `const C = () => <Input onChange={function(e) { setValue(e.target.value); }} />;`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-inline-function-props')).toBe(true);
  });

  it('does not report a stable function reference', () => {
    const code = `const C = () => <Button onClick={handleClick} />;`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-inline-function-props')).toBe(false);
  });

  it('does not report non-event props (no "on" prefix)', () => {
    const code = `const C = () => <El transform={() => val.trim()} />;`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-inline-function-props')).toBe(false);
  });
});

// ─── Feature 5b: eco/react-no-index-as-key ───────────────────────────────────

describe('eco/react-no-index-as-key', () => {
  it('reports when the .map index parameter is used as key', () => {
    const code = `const C = () => items.map((item, index) => <li key={index}>{item}</li>);`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-index-as-key')).toBe(true);
  });

  it('reports common index variable names (i, idx)', () => {
    const code = `const C = () => items.map((item, idx) => <li key={idx}>{item}</li>);`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-index-as-key')).toBe(true);
  });

  it('does not report when a stable id is used as key', () => {
    const code = `const C = () => items.map(item => <li key={item.id}>{item.name}</li>);`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-index-as-key')).toBe(false);
  });

  it('does not report string literal keys', () => {
    const code = `const C = () => <li key="static-key">item</li>;`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/react-no-index-as-key')).toBe(false);
  });
});

// ─── Feature 5c: eco/next-no-img-element ─────────────────────────────────────

describe('eco/next-no-img-element', () => {
  it('reports a raw <img> element in JSX', () => {
    const code = `const C = () => <img src="/logo.png" alt="Logo" />;`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/next-no-img-element')).toBe(true);
  });

  it('does not report a next/image <Image> component (capital I)', () => {
    const code = `import Image from 'next/image';\nconst C = () => <Image src="/logo.png" alt="Logo" width={100} height={100} />;`;
    const result = analyzeFile('test.tsx', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/next-no-img-element')).toBe(false);
  });

  it('does not fire on non-JSX files', () => {
    const code = `const tag = '<img src="x" />';`;
    const result = analyzeFile('test.ts', code, DEFAULT_CONFIG);
    expect(result.violations.some(v => v.ruleId === 'eco/next-no-img-element')).toBe(false);
  });
});
