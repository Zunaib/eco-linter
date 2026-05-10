import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

export const noHeavyMoment: EcoRule = {
  name: 'eco/no-heavy-moment',
  pillar: 'dependency',
  severity: 'error',
  energyImpact: 'high',

  create(context: RuleContext): RuleListener {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const source = node.source.value;
        if (source !== 'moment' && !source.startsWith('moment/')) return;

        context.report({
          pillar: 'dependency',
          severity: 'error',
          energyImpact: 'high',
          estimatedSavingKb: 61,
          message: `\`moment\` is tree-shake-hostile and adds ~67KB min+gzip to your bundle.`,
          suggestion: `Replace with \`date-fns\` (ESM, tree-shakable) or the native \`Intl\` API. Each function import from \`date-fns\` is <1KB.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
