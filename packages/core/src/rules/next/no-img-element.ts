import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

export const nextNoImgElement: EcoRule = {
  name: 'eco/next-no-img-element',
  pillar: 'dependency',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          node.name.name !== 'img'
        ) return;

        context.report({
          pillar: 'dependency',
          severity: 'warn',
          energyImpact: 'medium',
          message: `Raw \`<img>\` bypasses Next.js automatic lazy-loading, resizing, and WebP conversion — increasing bandwidth and render cost.`,
          suggestion: `Use \`next/image\`: import Image from 'next/image'; then <Image src="..." width={X} height={X} alt="..." />`,
          estimatedSavingKb: 40,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
