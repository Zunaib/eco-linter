import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

const ARRAY_ITERATION_METHODS = new Set([
  'forEach', 'map', 'filter', 'reduce', 'find', 'findIndex',
  'every', 'some', 'flatMap', 'reduceRight',
]);

function isArrayIterationCall(node: TSESTree.CallExpression): boolean {
  if (node.callee.type !== 'MemberExpression') return false;
  const prop = node.callee.property;
  return prop.type === 'Identifier' && ARRAY_ITERATION_METHODS.has(prop.name);
}

function findParentIterationCall(node: TSESTree.Node): TSESTree.CallExpression | null {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    if (
      current.type === 'CallExpression' &&
      isArrayIterationCall(current as TSESTree.CallExpression)
    ) {
      return current as TSESTree.CallExpression;
    }
    // Stop at function/arrow boundaries that aren't directly the callback
    if (
      (current.type === 'FunctionDeclaration' || current.type === 'FunctionExpression') &&
      current.parent?.type !== 'CallExpression'
    ) {
      break;
    }
    current = current.parent;
  }
  return null;
}

export const noNestedArrayIterations: EcoRule = {
  name: 'eco/no-nested-array-iterations',
  pillar: 'loop',
  severity: 'warn',
  energyImpact: 'high',

  create(context: RuleContext): RuleListener {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isArrayIterationCall(node)) return;
        const outer = findParentIterationCall(node);
        if (!outer) return;

        const outerProp = (outer.callee as TSESTree.MemberExpression).property as TSESTree.Identifier;
        const innerProp = (node.callee as TSESTree.MemberExpression).property as TSESTree.Identifier;

        context.report({
          pillar: 'loop',
          severity: 'warn',
          energyImpact: 'high',
          message: `Nested \`.${innerProp.name}()\` inside \`.${outerProp.name}()\` creates an O(n²) iteration pattern.`,
          suggestion: `Consider flattening to a single loop, using a Map/Set for lookups, or restructuring data before iteration.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
