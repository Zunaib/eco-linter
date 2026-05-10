import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

const POLLING_THRESHOLD_MS = 500;

export const noPollingSetInterval: EcoRule = {
  name: 'eco/no-polling-setinterval',
  pillar: 'loop',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        const callee = node.callee;
        const isSetInterval =
          (callee.type === 'Identifier' && callee.name === 'setInterval') ||
          (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'setInterval');

        if (!isSetInterval) return;

        const intervalArg = node.arguments[1];
        if (!intervalArg) return;

        // Only flag numeric literals we can statically evaluate
        if (intervalArg.type !== 'Literal') return;
        const intervalMs = typeof intervalArg.value === 'number' ? intervalArg.value : null;
        if (intervalMs === null || intervalMs >= POLLING_THRESHOLD_MS) return;

        context.report({
          pillar: 'loop',
          severity: 'warn',
          energyImpact: 'medium',
          message: `\`setInterval\` with ${intervalMs}ms interval runs ${Math.round(1000 / intervalMs)} times/sec — high CPU wake frequency.`,
          suggestion: `Consider event-driven patterns, \`requestAnimationFrame\`, or increase the interval above ${POLLING_THRESHOLD_MS}ms.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
