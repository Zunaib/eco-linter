import type { AnalysisResult } from '../types.js';

export function jsonReport(result: AnalysisResult): string {
  return JSON.stringify(result, null, 2);
}
