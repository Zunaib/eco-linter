import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export interface HistoryEntry {
  timestamp: string;
  score: number;
  grade: string;
  co2ePerBuild: number;
  fileCount: number;
  errorCount: number;
  warnCount: number;
}

export type ScoreTrend = 'up' | 'down' | 'stable' | 'new';

const HISTORY_FILE = '.eco-linter-history.json';
const MAX_ENTRIES = 30;

export async function readHistory(cwd: string): Promise<HistoryEntry[]> {
  const filePath = path.join(cwd, HISTORY_FILE);
  if (!existsSync(filePath)) return [];
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function appendHistory(cwd: string, entry: HistoryEntry): Promise<void> {
  const history = await readHistory(cwd);
  history.push(entry);
  const trimmed = history.slice(-MAX_ENTRIES);
  await writeFile(path.join(cwd, HISTORY_FILE), JSON.stringify(trimmed, null, 2), 'utf-8');
}

export function getScoreTrend(history: HistoryEntry[]): ScoreTrend {
  if (history.length < 2) return 'new';
  const last = history[history.length - 1]!;
  const prev = history[history.length - 2]!;
  const delta = last.score - prev.score;
  if (delta > 1) return 'up';
  if (delta < -1) return 'down';
  return 'stable';
}

export function getTrendDelta(history: HistoryEntry[]): number {
  if (history.length < 2) return 0;
  return (history[history.length - 1]?.score ?? 0) - (history[history.length - 2]?.score ?? 0);
}

/** Render a compact ASCII sparkline from the last N score entries. */
export function sparkline(history: HistoryEntry[], width = 10): string {
  if (history.length < 2) return '';
  const values = history.slice(-width).map(e => e.score);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return values
    .map(v => blocks[Math.round(((v - min) / range) * (blocks.length - 1))] ?? '▁')
    .join('');
}
