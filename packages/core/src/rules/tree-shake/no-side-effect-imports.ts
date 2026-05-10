import path from 'node:path';
import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

const KNOWN_SAFE_SIDE_EFFECTS = new Set([
  'reflect-metadata',
  'zone.js',
  'zone.js/dist/zone',
  './polyfills',
  '../polyfills',
]);

function isAssetImport(source: string): boolean {
  return /\.(css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(source);
}

function isInSideEffectsField(
  importSource: string,
  filePath: string,
  sideEffects: boolean | string[] | undefined,
): boolean {
  if (sideEffects === true) return true;
  if (sideEffects === false || sideEffects === undefined) return false;

  // sideEffects is string[] — check if the import matches any listed path
  const fileDir = path.dirname(filePath);
  const resolved = importSource.startsWith('.')
    ? path.resolve(fileDir, importSource)
    : importSource;

  return sideEffects.some(pattern => {
    const resolvedPattern = pattern.startsWith('.')
      ? path.resolve(path.dirname(filePath), pattern)
      : pattern;
    // Match exactly or with common extensions
    return (
      resolved === resolvedPattern ||
      resolved === resolvedPattern.replace(/\.[^.]+$/, '') ||
      importSource === pattern
    );
  });
}

export const noSideEffectImports: EcoRule = {
  name: 'eco/no-side-effect-imports',
  pillar: 'tree-shake',
  severity: 'error',
  energyImpact: 'high',

  create(context: RuleContext): RuleListener {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (node.specifiers.length > 0) return;

        const source = node.source.value;
        if (KNOWN_SAFE_SIDE_EFFECTS.has(source)) return;
        if (isAssetImport(source)) return;

        // Respect the project's package.json sideEffects declaration
        const { sideEffects } = context.getProjectMeta();
        if (isInSideEffectsField(source, context.getFilename(), sideEffects)) return;

        context.report({
          pillar: 'tree-shake',
          severity: 'error',
          energyImpact: 'high',
          message: `Side-effect import \`import '${source}'\` blocks tree-shaking for all consumers of this module.`,
          suggestion: `Import specific exports instead: \`import { thing } from '${source}'\`. If intentional, list it in the \`sideEffects\` field in package.json.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
