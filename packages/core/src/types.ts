// ─── Core domain types ───────────────────────────────────────────────────────

export type Pillar = 'loop' | 'dependency' | 'tree-shake' | 'algorithm';
export type Severity = 'error' | 'warn' | 'info';
export type EnergyImpact = 'high' | 'medium' | 'low';
export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
export type Region = 'us-east' | 'us-west' | 'eu-west' | 'ap-southeast' | number;
export type Reporter = 'pretty' | 'json' | 'sarif' | 'github-annotations' | 'markdown' | 'html';

// ─── Carbon Score ─────────────────────────────────────────────────────────────

export interface CarbonScore {
  overall: number;
  pillars: {
    loopEfficiency: number;
    dependencyHealth: number;
    treeShakability: number;
    algorithmicComplexity: number;
  };
  grade: Grade;
  estimatedCO2ePerBuild: number;
}

// ─── Analysis Results ─────────────────────────────────────────────────────────

export interface Violation {
  ruleId: string;
  pillar: Pillar;
  severity: Severity;
  energyImpact: EnergyImpact;
  message: string;
  suggestion?: string;
  estimatedSavingKb?: number;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

export interface FileResult {
  filePath: string;
  violations: Violation[];
  score: number;
}

export interface AnalysisResult {
  files: FileResult[];
  score: CarbonScore;
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
    totalFiles: number;
    analyzedAt: string;
  };
}

// ─── Rule interface ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuleListener = Record<string, ((node: any) => void) | undefined>;

export interface RuleContext {
  report(violation: Omit<Violation, 'ruleId'>): void;
  getFilename(): string;
  getSourceCode(): string;
}

export interface EcoRule {
  name: string;
  pillar: Pillar;
  severity: Severity;
  energyImpact: EnergyImpact;
  create(context: RuleContext): RuleListener;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export type RuleSeverityOverride = 'error' | 'warn' | 'info' | 'off';

export interface EcoLinterConfig {
  include: string[];
  exclude: string[];
  region: Region;
  target: string;
  rules: Record<string, RuleSeverityOverride>;
  badge: {
    outputPath: string;
    style: 'flat' | 'flat-square' | 'for-the-badge';
    autoUpdateReadme: boolean;
  };
  minScore: number;
  reporter: Reporter;
}

export const DEFAULT_CONFIG: EcoLinterConfig = {
  include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', 'node_modules', 'dist'],
  region: 'eu-west',
  target: 'es2022',
  rules: {},
  badge: {
    outputPath: './badges/eco-score.svg',
    style: 'flat-square',
    autoUpdateReadme: false,
  },
  minScore: 70,
  reporter: 'pretty',
};
