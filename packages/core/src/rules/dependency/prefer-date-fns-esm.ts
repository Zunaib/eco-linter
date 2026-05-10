import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

// CJS-only subpaths that force the full CJS bundle
const CJS_DATE_FNS_PATTERNS = [
  'date-fns/esm',           // old v2 CJS compat path
  'date-fns/index.js',
];

export const preferDateFnsEsm: EcoRule = {
  name: 'eco/prefer-date-fns-esm',
  pillar: 'dependency',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const source = node.source.value;

        // Flag bare `date-fns` in a CJS context or via CJS subpath
        const isCjsPath = CJS_DATE_FNS_PATTERNS.some(p => source === p || source.startsWith(p + '/'));
        if (!isCjsPath) return;

        context.report({
          pillar: 'dependency',
          severity: 'warn',
          energyImpact: 'medium',
          message: `Importing \`${source}\` loads the CJS bundle, defeating tree-shaking.`,
          suggestion: `Use named imports from \`date-fns\` directly: \`import { format } from 'date-fns'\` — bundlers will tree-shake to only the functions you use.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
