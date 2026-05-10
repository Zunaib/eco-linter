import { parse } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/utils';
import type {
  AnalysisResult,
  EcoLinterConfig,
  EcoRule,
  FileResult,
  RuleContext,
  RuleListener,
  Violation,
} from './types.js';
import { ALL_RULES, RULES_BY_NAME } from './rules/index.js';
import { calculateFileScore, calculateScore } from './scoring/calculator.js';
import { DEFAULT_CONFIG } from './types.js';

// ─── Suppression comment parsing ─────────────────────────────────────────────

type Suppression = { line: number | 'file'; rule: string | null };

function extractSuppressions(comments: TSESTree.Comment[]): Suppression[] {
  const suppressions: Suppression[] = [];
  for (const comment of comments) {
    const text = comment.value.trim();
    if (text.startsWith('eco-linter-disable-next-line')) {
      const rule = text.slice('eco-linter-disable-next-line'.length).trim() || null;
      suppressions.push({ line: comment.loc.start.line + 1, rule });
    } else if (text.startsWith('eco-linter-disable')) {
      const rule = text.slice('eco-linter-disable'.length).trim() || null;
      suppressions.push({ line: 'file', rule });
    }
  }
  return suppressions;
}

function isSuppressed(suppressions: Suppression[], violationLine: number, ruleId: string): boolean {
  return suppressions.some(
    s => (s.line === 'file' || s.line === violationLine) && (s.rule === null || s.rule === ruleId),
  );
}

// ─── Rule helpers ─────────────────────────────────────────────────────────────

function getActiveRules(config: EcoLinterConfig): EcoRule[] {
  return ALL_RULES.filter(rule => {
    const override = config.rules[rule.name];
    if (override === 'off') return false;
    return true;
  });
}

function applyRuleOverride(rule: EcoRule, config: EcoLinterConfig): EcoRule['severity'] {
  const override = config.rules[rule.name];
  if (override && override !== 'off') return override;
  return rule.severity;
}

// ─── AST walker ───────────────────────────────────────────────────────────────

type NodeVisitor = (node: TSESTree.Node) => void;

function walkNode(node: TSESTree.Node, visitors: Map<string, NodeVisitor[]>): void {
  const handlers = visitors.get(node.type);
  if (handlers) {
    for (const handler of handlers) {
      handler(node);
    }
  }

  for (const key of Object.keys(node) as (keyof typeof node)[]) {
    if (key === 'parent') continue;
    const child = node[key];
    if (child && typeof child === 'object') {
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && 'type' in item) {
            const astItem = item as unknown as TSESTree.Node;
            astItem.parent = node;
            walkNode(astItem, visitors);
          }
        }
      } else if ('type' in (child as object)) {
        const astChild = child as unknown as TSESTree.Node;
        astChild.parent = node;
        walkNode(astChild, visitors);
      }
    }
  }
}

// ─── File analysis ────────────────────────────────────────────────────────────

export function analyzeFile(
  filePath: string,
  sourceCode: string,
  config: EcoLinterConfig = DEFAULT_CONFIG,
): FileResult {
  const violations: Violation[] = [];

  let ast: TSESTree.Program;
  try {
    ast = parse(sourceCode, {
      jsx: filePath.endsWith('.jsx') || filePath.endsWith('.tsx'),
      loc: true,
      range: true,
      tokens: false,
      comment: true,
    });
  } catch {
    return { filePath, violations: [], score: 100 };
  }

  const suppressions = extractSuppressions(ast.comments ?? []);
  const projectMeta = { sideEffects: config.sideEffects };

  const activeRules = getActiveRules(config);
  const visitors = new Map<string, NodeVisitor[]>();

  for (const rule of activeRules) {
    const effectiveSeverity = applyRuleOverride(rule, config);
    const context: RuleContext = {
      report(v) {
        if (!isSuppressed(suppressions, v.line, rule.name)) {
          violations.push({ ...v, ruleId: rule.name, severity: effectiveSeverity });
        }
      },
      getFilename: () => filePath,
      getSourceCode: () => sourceCode,
      getProjectMeta: () => projectMeta,
    };

    const listener: RuleListener = rule.create(context);
    for (const [nodeType, handler] of Object.entries(listener)) {
      if (!handler) continue;
      const existing = visitors.get(nodeType) ?? [];
      existing.push(handler as NodeVisitor);
      visitors.set(nodeType, existing);
    }
  }

  walkNode(ast, visitors);

  return {
    filePath,
    violations,
    score: calculateFileScore(violations),
  };
}

// ─── Multi-file analysis ──────────────────────────────────────────────────────

export function analyze(
  files: Array<{ path: string; content: string }>,
  config: EcoLinterConfig = DEFAULT_CONFIG,
): AnalysisResult {
  const fileResults = files.map(f => analyzeFile(f.path, f.content, config));
  const score = calculateScore(fileResults, config.region);

  const allViolations = fileResults.flatMap(f => f.violations);

  return {
    files: fileResults,
    score,
    summary: {
      errorCount: allViolations.filter(v => v.severity === 'error').length,
      warningCount: allViolations.filter(v => v.severity === 'warn').length,
      infoCount: allViolations.filter(v => v.severity === 'info').length,
      totalFiles: files.length,
      analyzedAt: new Date().toISOString(),
    },
  };
}

export { ALL_RULES, RULES_BY_NAME };
