import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

function isInsideLoop(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    if (
      current.type === 'ForStatement' ||
      current.type === 'ForInStatement' ||
      current.type === 'ForOfStatement' ||
      current.type === 'WhileStatement' ||
      current.type === 'DoWhileStatement'
    ) return true;
    // forEach/map/filter callbacks count as loops
    if (
      current.type === 'CallExpression' &&
      current.callee.type === 'MemberExpression' &&
      current.callee.property.type === 'Identifier' &&
      ['forEach', 'map', 'filter', 'reduce'].includes(current.callee.property.name)
    ) return true;
    if (
      current.type === 'FunctionDeclaration' ||
      (current.type === 'FunctionExpression' && current.parent?.type !== 'CallExpression') ||
      current.type === 'Program'
    ) break;
    current = current.parent;
  }
  return false;
}

export const preferMapOverLinearFind: EcoRule = {
  name: 'eco/prefer-map-over-linear-find',
  pillar: 'algorithm',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== 'MemberExpression') return;
        const prop = node.callee.property;
        if (prop.type !== 'Identifier') return;
        if (prop.name !== 'find' && prop.name !== 'findIndex') return;
        if (!isInsideLoop(node)) return;

        context.report({
          pillar: 'algorithm',
          severity: 'warn',
          energyImpact: 'medium',
          message: `\`.${prop.name}()\` inside a loop creates an O(n²) lookup pattern.`,
          suggestion: `Pre-build a \`Map\` or \`Set\` outside the loop for O(1) lookups: \`const lookup = new Map(items.map(i => [i.id, i]))\`.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
