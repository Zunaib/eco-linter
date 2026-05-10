import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

// Polyfills for APIs that are native in ES2020+ / modern browsers
const KNOWN_POLYFILLS: Record<string, { native: string; since: string }> = {
  'core-js/features/promise': { native: 'Promise', since: 'ES2015' },
  'core-js/features/array/flat': { native: 'Array.prototype.flat', since: 'ES2019' },
  'core-js/features/array/flat-map': { native: 'Array.prototype.flatMap', since: 'ES2019' },
  'core-js/features/object/from-entries': { native: 'Object.fromEntries', since: 'ES2019' },
  'core-js/features/string/match-all': { native: 'String.prototype.matchAll', since: 'ES2020' },
  'whatwg-fetch': { native: 'fetch', since: 'browsers 2015+ / Node 18+' },
  'unfetch': { native: 'fetch', since: 'browsers 2015+ / Node 18+' },
  'es6-promise': { native: 'Promise', since: 'ES2015' },
  'promise-polyfill': { native: 'Promise', since: 'ES2015' },
  'abortcontroller-polyfill': { native: 'AbortController', since: 'browsers 2017+ / Node 15+' },
  'intersection-observer': { native: 'IntersectionObserver', since: 'browsers 2017+' },
  'resize-observer-polyfill': { native: 'ResizeObserver', since: 'browsers 2020+' },
};

export const preferNativeOverPolyfill: EcoRule = {
  name: 'eco/prefer-native-over-polyfill',
  pillar: 'dependency',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const source = node.source.value;
        const polyfill = KNOWN_POLYFILLS[source];
        if (!polyfill) return;

        context.report({
          pillar: 'dependency',
          severity: 'warn',
          energyImpact: 'medium',
          message: `\`${source}\` polyfills \`${polyfill.native}\` which is natively supported since ${polyfill.since}.`,
          suggestion: `Remove this polyfill if your target environment is ES2022+. Set \`target: 'es2022'\` in your eco-linter config.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
