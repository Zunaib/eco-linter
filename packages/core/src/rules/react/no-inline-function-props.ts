import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

export const reactNoInlineFunctionProps: EcoRule = {
  name: 'eco/react-no-inline-function-props',
  pillar: 'loop',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        const attrName =
          node.name.type === 'JSXIdentifier' ? node.name.name : null;
        // Only flag event-handler-style props (on*)
        if (!attrName || !attrName.startsWith('on')) return;

        const val = node.value;
        if (!val || val.type !== 'JSXExpressionContainer') return;

        const expr = val.expression;
        if (
          expr.type !== 'ArrowFunctionExpression' &&
          expr.type !== 'FunctionExpression'
        ) return;

        context.report({
          pillar: 'loop',
          severity: 'warn',
          energyImpact: 'medium',
          message: `Inline function in \`${attrName}\` prop creates a new function instance on every render.`,
          suggestion: `Extract to a stable reference with useCallback: const handler = useCallback(() => { ... }, [deps])`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
