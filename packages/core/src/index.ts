// Main public API for @eco-linter/core

export { analyze, analyzeFile, ALL_RULES, RULES_BY_NAME } from './analyzer.js';
export { calculateScore, calculateFileScore } from './scoring/calculator.js';
export { formatReport, prettyReport, jsonReport, githubAnnotationsReport, sarifReport } from './reporters/index.js';
export { loadConfig, defineConfig } from './config.js';
export { readHistory, appendHistory, getScoreTrend, getTrendDelta, sparkline } from './history.js';
export type { HistoryEntry, ScoreTrend } from './history.js';
export type {
  AnalysisResult,
  FileResult,
  Violation,
  CarbonScore,
  EcoRule,
  EcoLinterConfig,
  RuleContext,
  RuleListener,
  Pillar,
  Severity,
  EnergyImpact,
  Grade,
  Region,
  Reporter,
} from './types.js';
export { DEFAULT_CONFIG } from './types.js';
