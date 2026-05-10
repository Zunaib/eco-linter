import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

import path from 'node:path';

function isBarrelFile(filePath: string): boolean {
  const base = path.basename(filePath, path.extname(filePath));
  return base === 'index';
}

export const noBarrelReexports: EcoRule = {
  name: 'eco/no-barrel-reexports',
  pillar: 'tree-shake',
  severity: 'warn',
  energyImpact: 'medium',

  create(context: RuleContext): RuleListener {
    if (!isBarrelFile(context.getFilename())) return {};

    let reexportCount = 0;

    return {
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        reexportCount++;
        context.report({
          pillar: 'tree-shake',
          severity: 'warn',
          energyImpact: 'medium',
          message: `\`export * from '${node.source.value}'\` in a barrel file forces bundlers to include the entire module, destroying tree-shaking.`,
          suggestion: `Re-export only specific named exports: \`export { Foo, Bar } from '${node.source.value}'\`, or remove the barrel file entirely.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },

      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        // Re-exports from another module in a barrel (no declaration, has source)
        if (!node.source || node.declaration) return;
        reexportCount++;
        // Only flag if there are many re-exports (indicates a barrel pattern)
        if (reexportCount >= 5) {
          context.report({
            pillar: 'tree-shake',
            severity: 'warn',
            energyImpact: 'medium',
            message: `This barrel file re-exports ${reexportCount}+ modules — bundlers may not tree-shake this correctly.`,
            suggestion: `Consider having consumers import directly from source files instead of through this barrel.`,
            line: node.loc.start.line,
            column: node.loc.start.column,
            endLine: node.loc.end.line,
            endColumn: node.loc.end.column,
          });
        }
      },
    };
  },
};
