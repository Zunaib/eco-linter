import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

export const preferNamedExports: EcoRule = {
  name: 'eco/prefer-named-exports',
  pillar: 'tree-shake',
  severity: 'info',
  energyImpact: 'low',

  create(context: RuleContext): RuleListener {
    return {
      ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration) {
        // Allow `export default` in entry point / config files
        const filename = context.getFilename();
        const isConfig = /\.(config|setup|main)\.[jt]sx?$/.test(filename);
        if (isConfig) return;

        context.report({
          pillar: 'tree-shake',
          severity: 'info',
          energyImpact: 'low',
          message: `Default exports prevent tree-shaking optimisation — consumers must import the entire default export.`,
          suggestion: `Use named exports instead: \`export const MyComponent = ...\` so bundlers can eliminate unused exports.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
