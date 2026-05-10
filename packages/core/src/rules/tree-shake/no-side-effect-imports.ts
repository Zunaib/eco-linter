import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

// Imports that are intentionally side-effectful and should not be flagged
const KNOWN_SAFE_SIDE_EFFECTS = new Set([
  'reflect-metadata',
  'zone.js',
  'zone.js/dist/zone',
  './polyfills',
  '../polyfills',
]);

// CSS/asset imports are expected side-effects — skip them
function isAssetImport(source: string): boolean {
  return /\.(css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(source);
}

export const noSideEffectImports: EcoRule = {
  name: 'eco/no-side-effect-imports',
  pillar: 'tree-shake',
  severity: 'error',
  energyImpact: 'high',

  create(context: RuleContext): RuleListener {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        // Side-effect import: no specifiers
        if (node.specifiers.length > 0) return;

        const source = node.source.value;
        if (KNOWN_SAFE_SIDE_EFFECTS.has(source)) return;
        if (isAssetImport(source)) return;

        context.report({
          pillar: 'tree-shake',
          severity: 'error',
          energyImpact: 'high',
          message: `Side-effect import \`import '${source}'\` blocks tree-shaking for all consumers of this module.`,
          suggestion: `Import specific exports instead: \`import { thing } from '${source}'\`. If this is an intentional side-effect, add it to the \`sideEffects\` field in package.json.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
