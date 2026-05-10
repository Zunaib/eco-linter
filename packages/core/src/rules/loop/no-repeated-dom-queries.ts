import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

const DOM_QUERY_METHODS = new Set([
  'querySelector', 'querySelectorAll', 'getElementById',
  'getElementsByClassName', 'getElementsByTagName', 'getElementsByName',
]);

function isInsideLoop(node: TSESTree.Node): boolean {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    if (
      current.type === 'ForStatement' ||
      current.type === 'ForInStatement' ||
      current.type === 'ForOfStatement' ||
      current.type === 'WhileStatement' ||
      current.type === 'DoWhileStatement'
    ) {
      return true;
    }
    // Stop at top-level function boundaries
    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      // Could be a forEach callback — keep going
      if (current.parent?.type !== 'CallExpression') break;
    }
    current = current.parent;
  }
  return false;
}

export const noRepeatedDomQueries: EcoRule = {
  name: 'eco/no-repeated-dom-queries',
  pillar: 'loop',
  severity: 'warn',
  energyImpact: 'high',

  create(context: RuleContext): RuleListener {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type !== 'MemberExpression') return;
        const prop = node.callee.property;
        if (prop.type !== 'Identifier' || !DOM_QUERY_METHODS.has(prop.name)) return;
        if (!isInsideLoop(node)) return;

        context.report({
          pillar: 'loop',
          severity: 'warn',
          energyImpact: 'high',
          message: `\`${prop.name}()\` called inside a loop causes repeated DOM traversal.`,
          suggestion: `Cache the DOM query result in a variable before the loop.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
