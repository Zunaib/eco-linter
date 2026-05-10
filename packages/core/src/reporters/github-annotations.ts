import type { AnalysisResult, Violation } from '../types.js';

function annotationLevel(severity: Violation['severity']): string {
  if (severity === 'error') return 'error';
  if (severity === 'warn') return 'warning';
  return 'notice';
}

export function githubAnnotationsReport(result: AnalysisResult): string {
  const lines: string[] = [];

  for (const file of result.files) {
    for (const v of file.violations) {
      const level = annotationLevel(v.severity);
      const title = v.ruleId;
      const msg = v.suggestion ? `${v.message} → ${v.suggestion}` : v.message;
      // GitHub Actions annotation format
      lines.push(
        `::${level} file=${file.filePath},line=${v.line},col=${v.column + 1},title=${title}::${msg}`,
      );
    }
  }

  // Summary notice
  const { score, summary } = result;
  lines.push(
    `::notice title=eco-linter Carbon Score::Score: ${score.overall}/100 [${score.grade}] | Est. CO₂e: ~${score.estimatedCO2ePerBuild}g/build | ${summary.errorCount} errors · ${summary.warningCount} warnings`,
  );

  return lines.join('\n');
}
