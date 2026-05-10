import type { TSESTree } from '@typescript-eslint/utils';
import type { EcoRule, RuleContext, RuleListener } from '../../types.js';

function getFunctionName(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression): string | null {
  if (node.id) return node.id.name;
  // Check if assigned to a variable: const fn = function() {}
  if (
    node.parent?.type === 'VariableDeclarator' &&
    node.parent.id.type === 'Identifier'
  ) {
    return node.parent.id.name;
  }
  return null;
}

function containsSelfCall(node: TSESTree.Node, name: string): boolean {
  let found = false;

  function walk(n: TSESTree.Node) {
    if (found) return;
    if (
      n.type === 'CallExpression' &&
      n.callee.type === 'Identifier' &&
      n.callee.name === name
    ) {
      found = true;
      return;
    }
    for (const key of Object.keys(n) as (keyof typeof n)[]) {
      const child = n[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && 'type' in item) walk(item as TSESTree.Node);
          }
        } else if ('type' in child) {
          walk(child as TSESTree.Node);
        }
      }
    }
  }

  walk(node);
  return found;
}

function hasMemoizationPattern(node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression): boolean {
  const src = JSON.stringify(node.body);
  // Heuristic: look for common memoization patterns (cache object, Map, has/get checks)
  return (
    src.includes('"cache"') ||
    src.includes('"memo"') ||
    src.includes('"Map"') ||
    src.includes('"has"') ||
    src.includes('"WeakMap"')
  );
}

export const noExponentialRecursion: EcoRule = {
  name: 'eco/no-exponential-recursion',
  pillar: 'algorithm',
  severity: 'error',
  energyImpact: 'high',

  create(context: RuleContext): RuleListener {
    return {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        const name = getFunctionName(node);
        if (!name) return;
        if (!containsSelfCall(node.body, name)) return;
        if (hasMemoizationPattern(node)) return;

        // Check if called more than once (exponential branching indicator)
        let callCount = 0;
        function countCalls(n: TSESTree.Node) {
          if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === name) {
            callCount++;
          }
          for (const key of Object.keys(n) as (keyof typeof n)[]) {
            const child = n[key];
            if (child && typeof child === 'object') {
              if (Array.isArray(child)) {
                for (const item of child) {
                  if (item && typeof item === 'object' && 'type' in item) countCalls(item as TSESTree.Node);
                }
              } else if ('type' in child) {
                countCalls(child as TSESTree.Node);
              }
            }
          }
        }
        countCalls(node.body);

        if (callCount < 2) return; // Single recursion = linear, not exponential

        context.report({
          pillar: 'algorithm',
          severity: 'error',
          energyImpact: 'high',
          message: `Recursive function \`${name}\` calls itself ${callCount} times per invocation without memoization — likely O(k^n) complexity.`,
          suggestion: `Add memoization: \`const cache = new Map(); if (cache.has(n)) return cache.get(n);\` or use an iterative approach.`,
          line: node.loc.start.line,
          column: node.loc.start.column,
          endLine: node.loc.end.line,
          endColumn: node.loc.end.column,
        });
      },
    };
  },
};
