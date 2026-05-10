import type { CarbonScore, FileResult, Grade, Region, Violation } from '../types.js';

// Carbon intensity by region (gCO₂/kWh)
const CARBON_INTENSITY: Record<string, number> = {
  'us-east': 386,
  'us-west': 210,
  'eu-west': 233,
  'ap-southeast': 493,
};

// Pillar weights must sum to 1.0
const PILLAR_WEIGHTS = {
  loopEfficiency: 0.30,
  dependencyHealth: 0.35,
  treeShakability: 0.25,
  algorithmicComplexity: 0.10,
} as const;

// Impact penalty points (subtracted from 100 per violation)
const IMPACT_PENALTY: Record<Violation['energyImpact'], number> = {
  high: 15,
  medium: 7,
  low: 3,
};

const SEVERITY_MULTIPLIER: Record<Violation['severity'], number> = {
  error: 1.0,
  warn: 0.6,
  info: 0.3,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function pillarScore(violations: Violation[], pillarKey: Violation['pillar']): number {
  const relevant = violations.filter(v => v.pillar === pillarKey);
  const penalty = relevant.reduce(
    (sum, v) => sum + IMPACT_PENALTY[v.energyImpact] * SEVERITY_MULTIPLIER[v.severity],
    0,
  );
  return clamp(100 - penalty);
}

function gradeFromScore(score: number): Grade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function estimateCO2e(
  score: number,
  totalFiles: number,
  region: Region,
): number {
  const gCO2PerKwh =
    typeof region === 'number'
      ? region
      : (CARBON_INTENSITY[region] ?? CARBON_INTENSITY['eu-west'] ?? 233);

  // Simplified model:
  // - Base compute: 150W TDP server at 50% utilisation for ~30s build
  // - Bundle size factor inversely proportional to score
  // - File count scales compute linearly
  const buildSeconds = 30 + totalFiles * 0.2;
  const utilizationFactor = 0.5;
  const tdpWatts = 150;
  const efficiencyMultiplier = 1 + (1 - score / 100) * 2; // worse score = more compute

  const energyKwh = (tdpWatts * utilizationFactor * buildSeconds * efficiencyMultiplier) / 3_600_000;
  const co2Grams = energyKwh * gCO2PerKwh;

  return parseFloat(co2Grams.toFixed(2));
}

export function calculateScore(
  files: FileResult[],
  region: Region = 'eu-west',
): CarbonScore {
  const allViolations = files.flatMap(f => f.violations);

  const pillars = {
    loopEfficiency: pillarScore(allViolations, 'loop'),
    dependencyHealth: pillarScore(allViolations, 'dependency'),
    treeShakability: pillarScore(allViolations, 'tree-shake'),
    algorithmicComplexity: pillarScore(allViolations, 'algorithm'),
  };

  const overall = clamp(
    Math.round(
      pillars.loopEfficiency * PILLAR_WEIGHTS.loopEfficiency +
      pillars.dependencyHealth * PILLAR_WEIGHTS.dependencyHealth +
      pillars.treeShakability * PILLAR_WEIGHTS.treeShakability +
      pillars.algorithmicComplexity * PILLAR_WEIGHTS.algorithmicComplexity,
    ),
  );

  return {
    overall,
    pillars,
    grade: gradeFromScore(overall),
    estimatedCO2ePerBuild: estimateCO2e(overall, files.length, region),
  };
}

export function calculateFileScore(violations: Violation[]): number {
  if (violations.length === 0) return 100;
  const penalty = violations.reduce(
    (sum, v) => sum + IMPACT_PENALTY[v.energyImpact] * SEVERITY_MULTIPLIER[v.severity],
    0,
  );
  return clamp(100 - penalty);
}
