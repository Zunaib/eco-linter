import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  readHistory,
  appendHistory,
  getScoreTrend,
  getTrendDelta,
  sparkline,
} from './history.js';
import type { HistoryEntry } from './history.js';

function entry(score: number, overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    timestamp: new Date().toISOString(),
    score,
    grade: score >= 85 ? 'A' : score >= 70 ? 'B' : 'C',
    co2ePerBuild: 0.5,
    fileCount: 10,
    errorCount: 0,
    warnCount: 2,
    ...overrides,
  };
}

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), 'eco-linter-test-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('readHistory', () => {
  it('returns empty array when no history file exists', async () => {
    expect(await readHistory(tmpDir)).toEqual([]);
  });
});

describe('appendHistory', () => {
  it('creates history file with first entry', async () => {
    await appendHistory(tmpDir, entry(75));
    const h = await readHistory(tmpDir);
    expect(h).toHaveLength(1);
    expect(h[0]!.score).toBe(75);
  });

  it('accumulates multiple entries in order', async () => {
    await appendHistory(tmpDir, entry(70));
    await appendHistory(tmpDir, entry(75));
    await appendHistory(tmpDir, entry(80));
    const h = await readHistory(tmpDir);
    expect(h.map(e => e.score)).toEqual([70, 75, 80]);
  });

  it('keeps at most 30 entries (oldest dropped)', async () => {
    for (let i = 0; i < 35; i++) {
      await appendHistory(tmpDir, entry(i));
    }
    const h = await readHistory(tmpDir);
    expect(h).toHaveLength(30);
    expect(h[0]!.score).toBe(5);   // entries 0-4 dropped
    expect(h[29]!.score).toBe(34);
  });
});

describe('getScoreTrend', () => {
  it('returns "new" for empty history', () => {
    expect(getScoreTrend([])).toBe('new');
  });

  it('returns "new" for a single entry', () => {
    expect(getScoreTrend([entry(70)])).toBe('new');
  });

  it('returns "up" when score increased by more than 1', () => {
    expect(getScoreTrend([entry(68), entry(75)])).toBe('up');
  });

  it('returns "down" when score decreased by more than 1', () => {
    expect(getScoreTrend([entry(80), entry(72)])).toBe('down');
  });

  it('returns "stable" when delta is exactly 0', () => {
    expect(getScoreTrend([entry(70), entry(70)])).toBe('stable');
  });

  it('returns "stable" when delta is ±1', () => {
    expect(getScoreTrend([entry(70), entry(71)])).toBe('stable');
    expect(getScoreTrend([entry(70), entry(69)])).toBe('stable');
  });
});

describe('getTrendDelta', () => {
  it('returns 0 for empty history', () => {
    expect(getTrendDelta([])).toBe(0);
  });

  it('returns 0 for single entry', () => {
    expect(getTrendDelta([entry(70)])).toBe(0);
  });

  it('returns positive delta for improvement', () => {
    expect(getTrendDelta([entry(70), entry(76)])).toBe(6);
  });

  it('returns negative delta for regression', () => {
    expect(getTrendDelta([entry(80), entry(74)])).toBe(-6);
  });
});

describe('sparkline', () => {
  it('returns empty string for a single entry', () => {
    expect(sparkline([entry(70)])).toBe('');
  });

  it('returns block characters for multi-entry history', () => {
    const result = sparkline([entry(40), entry(60), entry(80), entry(100)]);
    expect(result).toMatch(/^[▁▂▃▄▅▆▇█]+$/u);
    expect(result.length).toBe(4);
  });

  it('respects the width cap', () => {
    const history = Array.from({ length: 20 }, (_, i) => entry(50 + i));
    expect(sparkline(history, 8).length).toBe(8);
  });

  it('uses the highest block for the max value', () => {
    const result = sparkline([entry(0), entry(100)]);
    expect(result[result.length - 1]).toBe('█');
  });

  it('uses the lowest block for the min value', () => {
    const result = sparkline([entry(0), entry(100)]);
    expect(result[0]).toBe('▁');
  });
});
