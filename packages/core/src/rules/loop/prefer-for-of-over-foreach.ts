import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

export const preferForOfOverForEach: EcoRule = {
  name: 'eco/prefer-for-of-over-foreach',
  pillar: 'loop',
  severity: 'info',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== 'MemberExpression') return;
        const prop = node.callee.property;
        if (prop.type !== 'Identifier' || prop.name !== 'forEach') return;

        const callback = node.arguments[0];
        if (!callback) return;
        if (
          callback.type !== 'ArrowFunctionExpression' &&
          callback.type !== 'FunctionExpression'
        ) return;

        // Only flag if the callback doesn't use the index/array params (simpler for-of candidate)
        const params = callback.params;
        if (params.length >= 2) return; // uses index — for-of won't work directly

        context.report({
          pillar: 'loop',
          severity: 'info',
          energyImpact: 'medium',
          message: `\`.forEach()\` is ~15–30% slower than \`for...of\` in V8 for large arrays.`,
          suggestion: `Replace with \`for (const item of array) { ... }\` for better performance.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
