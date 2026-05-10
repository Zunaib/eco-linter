import type { AnalysisResult, CarbonScore, FileResult, Violation } from '../types.js';

function gradeToColor(grade: CarbonScore['grade']): string {
  const map: Record<string, string> = {
    'A+': '00c853', 'A': '64dd17', 'B': 'ffd600',
    'C': 'ff6d00', 'D': 'dd2c00', 'F': 'b71c1c',
  };
  return map[grade] ?? '9e9e9e';
}

function pillarBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function severityEmoji(severity: Violation['severity']): string {
  if (severity === 'error') return '🔴';
  if (severity === 'warn') return '🟡';
  return '🔵';
}

function impactBadge(impact: Violation['energyImpact']): string {
  if (impact === 'high') return '`HIGH`';
  if (impact === 'medium') return '`MED`';
  return '`LOW`';
}

function violationTable(violations: Violation[], filePath: string): string {
  if (violations.length === 0) return '';

  const rows = violations.map(v => {
    const icon = severityEmoji(v.severity);
    const impact = impactBadge(v.energyImpact);
    const location = `\`${filePath}:${v.line}\``;
    const rule = `\`${v.ruleId}\``;
    const saving = v.estimatedSavingKb ? ` *(saves ~${v.estimatedSavingKb}KB)*` : '';
    return `| ${icon} | ${impact} | ${location} | ${rule} | ${v.message}${saving} |`;
  });

  return [
    '| | Impact | Location | Rule | Message |',
    '|---|---|---|---|---|',
    ...rows,
  ].join('\n');
}

function suggestionsList(violations: Violation[]): string {
  const withSuggestions = violations.filter(v => v.suggestion);
  if (withSuggestions.length === 0) return '';

  return withSuggestions
    .map(v => `- **\`${v.ruleId}\`** — ${v.suggestion}`)
    .join('\n');
}

function fileSection(file: FileResult): string {
  if (file.violations.length === 0) return '';

  const sections: string[] = [];
  const shortPath = file.filePath.replace(process.cwd(), '.');

  sections.push(`### \`${shortPath}\``);
  sections.push('');
  sections.push(violationTable(file.violations, shortPath));

  const suggestions = suggestionsList(file.violations);
  if (suggestions) {
    sections.push('');
    sections.push('**Suggestions:**');
    sections.push('');
    sections.push(suggestions);
  }

  return sections.join('\n');
}

export function markdownReport(result: AnalysisResult): string {
  const { score, summary, files } = result;
  const color = gradeToColor(score.grade);
  const badgeUrl = `https://img.shields.io/badge/eco--score-${score.overall}%20${score.grade}-${color}?style=flat-square`;
  const analyzedAt = new Date(summary.analyzedAt).toLocaleString();

  const sections: string[] = [];

  // Header
  sections.push(`# 🌱 eco-linter Carbon Report`);
  sections.push('');
  sections.push(`![eco-score](${badgeUrl})`);
  sections.push('');
  sections.push(`> Generated ${analyzedAt} · ${summary.totalFiles} files analyzed`);
  sections.push('');

  // Score summary
  sections.push('## Carbon Score');
  sections.push('');
  sections.push('| Metric | Value |');
  sections.push('|--------|-------|');
  sections.push(`| **Overall Score** | **${score.overall} / 100** |`);
  sections.push(`| **Grade** | **${score.grade}** |`);
  sections.push(`| **Est. CO₂e per build** | ~${score.estimatedCO2ePerBuild}g *(estimate — see methodology)* |`);
  sections.push(`| Errors | ${summary.errorCount} |`);
  sections.push(`| Warnings | ${summary.warningCount} |`);
  sections.push(`| Info | ${summary.infoCount} |`);
  sections.push('');

  // Pillar breakdown
  sections.push('## Pillar Breakdown');
  sections.push('');
  sections.push('| Pillar | Score | Bar | Weight |');
  sections.push('|--------|------:|-----|--------|');

  const pillars: Array<[string, number, string]> = [
    ['Loop Efficiency', score.pillars.loopEfficiency, '30%'],
    ['Dependency Health', score.pillars.dependencyHealth, '35%'],
    ['Tree-Shakability', score.pillars.treeShakability, '25%'],
    ['Algorithmic Complexity', score.pillars.algorithmicComplexity, '10%'],
  ];

  for (const [label, pillarScore, weight] of pillars) {
    const flag = pillarScore < 70 ? ' ⚠️' : pillarScore >= 90 ? ' ✅' : '';
    sections.push(`| ${label}${flag} | ${pillarScore} | \`${pillarBar(pillarScore)}\` | ${weight} |`);
  }
  sections.push('');

  // Violations
  const filesWithViolations = files.filter(f => f.violations.length > 0);
  if (filesWithViolations.length === 0) {
    sections.push('## Violations');
    sections.push('');
    sections.push('✅ **No violations found — perfect score!**');
  } else {
    sections.push('## Violations');
    sections.push('');

    // Errors first, then warnings, then info
    const errors = filesWithViolations.filter(f => f.violations.some(v => v.severity === 'error'));
    const warnings = filesWithViolations.filter(f => f.violations.some(v => v.severity === 'warn') && !errors.includes(f));
    const infos = filesWithViolations.filter(f => !errors.includes(f) && !warnings.includes(f));

    for (const file of [...errors, ...warnings, ...infos]) {
      sections.push(fileSection(file));
      sections.push('');
    }
  }

  // Grade scale reference
  sections.push('## Grade Scale');
  sections.push('');
  sections.push('| Grade | Score | Meaning |');
  sections.push('|-------|-------|---------|');
  sections.push('| A+    | 95–100 | Exemplary — industry best practice |');
  sections.push('| A     | 85–94  | Excellent — minor improvements possible |');
  sections.push('| B     | 70–84  | Good — some inefficiencies to address |');
  sections.push('| C     | 55–69  | Fair — several high-impact issues |');
  sections.push('| D     | 40–54  | Poor — significant work needed |');
  sections.push('| F     | 0–39   | Critical — major inefficiencies throughout |');
  sections.push('');

  // Methodology note
  sections.push('---');
  sections.push('');
  sections.push('> **Methodology note:** CO₂e estimates are approximations based on cyclomatic complexity, bundle size proxies, and regional carbon intensity (gCO₂/kWh). They are not power measurements. See [eco-linter docs](https://github.com/eco-linter/eco-linter) for the full model.');
  sections.push('');
  sections.push('*Generated by [eco-linter](https://github.com/eco-linter/eco-linter) v1.0.0*');

  return sections.join('\n');
}
