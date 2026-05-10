import type { AnalysisResult, CarbonScore, Violation } from '../types.js';
import type { HistoryEntry } from '../history.js';
import { getScoreTrend, getTrendDelta, sparkline } from '../history.js';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function severityIcon(severity: Violation['severity']): string {
  if (severity === 'error') return `${RED}✗${RESET}`;
  if (severity === 'warn') return `${YELLOW}⚠${RESET}`;
  return `${BLUE}ℹ${RESET}`;
}

function impactLabel(impact: Violation['energyImpact']): string {
  if (impact === 'high') return `${RED}HIGH${RESET}`;
  if (impact === 'medium') return `${YELLOW}MED ${RESET}`;
  return `${GRAY}LOW ${RESET}`;
}

function bar(score: number, width = 13): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  let color = GREEN;
  if (score < 55) color = RED;
  else if (score < 70) color = YELLOW;
  return `${color}${'█'.repeat(filled)}${GRAY}${'░'.repeat(empty)}${RESET}`;
}

function gradeColor(grade: CarbonScore['grade']): string {
  if (grade === 'A+' || grade === 'A') return GREEN;
  if (grade === 'B') return CYAN;
  if (grade === 'C') return YELLOW;
  return RED;
}

function trendLine(history: HistoryEntry[]): string {
  const trend = getScoreTrend(history);
  if (trend === 'new') return '';

  const delta = getTrendDelta(history);
  const prev = history[history.length - 2]!.score;
  const spark = sparkline(history);

  const sign = delta > 0 ? '+' : '';
  let arrow = '→';
  let color = GRAY;
  if (trend === 'up') { arrow = '↑'; color = GREEN; }
  if (trend === 'down') { arrow = '↓'; color = RED; }

  return `  ${color}${arrow} ${sign}${delta} from last run (${prev} → ${history[history.length - 1]!.score})  ${DIM}${spark}${RESET}`;
}

export function prettyReport(result: AnalysisResult, history: HistoryEntry[] = []): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(`${BOLD}eco-linter v1.0.0${RESET}`);
  lines.push('');
  lines.push(`${DIM}Analyzing ${result.summary.totalFiles} files...${RESET}`);
  lines.push('');

  const fileViolations = result.files.filter(f => f.violations.length > 0);
  if (fileViolations.length === 0) {
    lines.push(`${GREEN}  No violations found — perfect score!${RESET}`);
  } else {
    for (const file of fileViolations) {
      for (const v of file.violations) {
        const loc = `${GRAY}${file.filePath}:${v.line}${RESET}`;
        const icon = severityIcon(v.severity);
        const impact = impactLabel(v.energyImpact);
        const rule = `${DIM}${v.ruleId}${RESET}`;
        lines.push(`  ${icon} [${impact}]  ${loc}  ${rule}`);
        lines.push(`             ${v.message}`);
        if (v.suggestion) {
          lines.push(`             ${DIM}→ ${v.suggestion}${RESET}`);
        }
        if (v.estimatedSavingKb) {
          lines.push(`             ${GREEN}💾 Saves ~${v.estimatedSavingKb}KB gzipped${RESET}`);
        }
        lines.push('');
      }
    }
  }

  const divider = `${GRAY}${'─'.repeat(45)}${RESET}`;
  lines.push(divider);

  const { score } = result;
  const gc = gradeColor(score.grade);
  lines.push(
    `  ${BOLD}Carbon Score:${RESET}   ${BOLD}${gc}${score.overall} / 100${RESET}   [${gc}${BOLD}${score.grade}${RESET}]`,
  );
  lines.push(
    `  ${BOLD}Est. CO₂e:${RESET}      ${CYAN}~${score.estimatedCO2ePerBuild}g per CI build${RESET}`,
  );

  if (history.length >= 2) {
    lines.push(trendLine(history));
  }

  lines.push('');
  lines.push(`  ${BOLD}Pillars:${RESET}`);

  const pillars: Array<[string, number]> = [
    ['Loop Efficiency         ', score.pillars.loopEfficiency],
    ['Dependency Health       ', score.pillars.dependencyHealth],
    ['Tree-Shakability        ', score.pillars.treeShakability],
    ['Algorithmic Complexity  ', score.pillars.algorithmicComplexity],
  ];

  for (const [label, pillarScore] of pillars) {
    const needsWork = pillarScore < 70 ? `  ${YELLOW}← needs work${RESET}` : '';
    lines.push(
      `    ${label} ${pillarScore.toString().padStart(3)} ${bar(pillarScore)}${needsWork}`,
    );
  }

  lines.push('');
  lines.push(
    `  ${RED}${result.summary.errorCount} error${result.summary.errorCount !== 1 ? 's' : ''}${RESET} · ${YELLOW}${result.summary.warningCount} warning${result.summary.warningCount !== 1 ? 's' : ''}${RESET} · ${BLUE}${result.summary.infoCount} info${RESET}`,
  );
  lines.push(divider);
  lines.push('');

  return lines.join('\n');
}
