import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

// Common names for the second (.map index) parameter
const COMMON_INDEX_NAMES = new Set(['i', 'j', 'k', 'n', 'idx', 'index', 'ind']);

export const reactNoIndexAsKey: EcoRule = {
  name: 'eco/react-no-index-as-key',
  pillar: 'loop',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    // Collect second-parameter names from .map() callbacks so we can identify
    // index variables regardless of what the developer named them.
    const mapIndexParams = new Set<string>();

    return {
      CallExpression(node: TSESTree.CallExpression) {
        const { callee } = node;
        if (
          callee.type !== 'MemberExpression' ||
          callee.property.type !== 'Identifier' ||
          callee.property.name !== 'map'
        ) return;

        const cb = node.arguments[0];
        if (
          !cb ||
          (cb.type !== 'ArrowFunctionExpression' && cb.type !== 'FunctionExpression')
        ) return;

        const indexParam = cb.params[1];
        if (indexParam?.type === 'Identifier') {
          mapIndexParams.add(indexParam.name);
        }
      },

      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          node.name.name !== 'key'
        ) return;

        const val = node.value;
        if (!val || val.type !== 'JSXExpressionContainer') return;

        const expr = val.expression;
        if (expr.type !== 'Identifier') return;

        const isKnownIndex =
          mapIndexParams.has(expr.name) || COMMON_INDEX_NAMES.has(expr.name);

        if (!isKnownIndex) return;

        context.report({
          pillar: 'loop',
          severity: 'warn',
          energyImpact: 'medium',
          message: `Using array index as React \`key\` causes unnecessary re-renders when the list order changes.`,
          suggestion: `Use a stable, unique identifier from the data instead: key={item.id}`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
