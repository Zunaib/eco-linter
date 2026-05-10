import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

export const noLodashFullImport: EcoRule = {
  name: 'eco/no-lodash-full-import',
  pillar: 'dependency',
  severity: 'error',
  energyImpact: 'high',

  create(context: RuleContext): RuleListener {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const source = node.source.value;

        // `import _ from 'lodash'` or `import { merge } from 'lodash'` — full bundle
        if (source === 'lodash' || source === 'lodash-es') {
          const isDefaultImport = node.specifiers.some(
            s => s.type === 'ImportDefaultSpecifier' || s.type === 'ImportNamespaceSpecifier',
          );
          const isNamedFromRoot = node.specifiers.some(
            s => s.type === 'ImportSpecifier',
          );

          if (isDefaultImport || isNamedFromRoot) {
            context.report({
              pillar: 'dependency',
              severity: 'error',
              energyImpact: 'high',
              estimatedSavingKb: source === 'lodash' ? 72 : 25,
              message: `Full \`${source}\` import ships the entire library (~${source === 'lodash' ? '72' : '25'}KB min+gzip).`,
              suggestion: `Use per-method imports: \`import merge from 'lodash/merge'\` or switch to \`lodash-es\` with named imports for tree-shaking.`,
              line: node.loc.start.line,
              column: node.loc.start.column,
              endLine: node.loc.end.line,
              endColumn: node.loc.end.column,
            });
          }
        }
      },
    };
  },
};
