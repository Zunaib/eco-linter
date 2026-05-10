import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

export const preferArrayDestructureSlice: EcoRule = {
  name: 'eco/prefer-array-destructure-slice',
  pillar: 'loop',
  severity: 'info',
  energyImpact: 'low',

  create(context: RuleContext): RuleListener {
    return {
      // Detect [...arr] spread that copies entire array when only a subset is needed
      SpreadElement(node: TSESTree.SpreadElement) {
        // [...arr] inside an array literal
        if (node.parent?.type !== 'ArrayExpression') return;
        const arrayExpr = node.parent as TSESTree.ArrayExpression;
        // Flag only if this is the sole element — i.e., a full copy: [...arr]
        if (arrayExpr.elements.length !== 1) return;

        context.report({
          pillar: 'loop',
          severity: 'info',
          energyImpact: 'low',
          message: `Full array copy via spread \`[...arr]\` — use \`.slice(start, end)\` if only a subset is needed.`,
          suggestion: `Replace \`[...arr]\` with \`arr.slice(start, end)\` to avoid copying the full array when only part is used.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },

      // Detect Array.from(arr) full copies
      CallExpression(node: TSESTree.CallExpression) {
        const callee = node.callee;
        if (callee.type !== 'MemberExpression') return;
        const obj = callee.object;
        const prop = callee.property;
        if (
          obj.type !== 'Identifier' || obj.name !== 'Array' ||
          prop.type !== 'Identifier' || prop.name !== 'from'
        ) return;
        // Only one arg = pure copy
        if (node.arguments.length !== 1) return;

        context.report({
          pillar: 'loop',
          severity: 'info',
          energyImpact: 'low',
          message: `\`Array.from(arr)\` creates a full copy — use \`.slice()\` or destructuring if only part of the array is needed.`,
          suggestion: `If you only need a subset, use \`arr.slice(start, end)\` instead.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
