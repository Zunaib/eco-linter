#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { glob } from 'glob';
import { analyze, formatReport, loadConfig } from '@eco-linter/core';
import { generateBadge, updateReadmeBadge } from '@eco-linter/badge';
import type { Reporter, EcoLinterConfig } from '@eco-linter/core';

interface CliArgs {
  configPath: string | undefined;
  format: Reporter;
  output: string | undefined;
  minScore: number | undefined;
  badgeOnly: boolean;
  badgeOutput: string | undefined;
  cwd: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const result: CliArgs = {
    configPath: undefined,
    format: 'pretty',
    output: undefined,
    minScore: undefined,
    badgeOnly: false,
    badgeOutput: undefined,
    cwd: process.cwd(),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--config':
      case '-c':
        if (next) { result.configPath = next; i++; }
        break;
      case '--format':
      case '-f':
        if (next) { result.format = next as Reporter; i++; }
        break;
      case '--output':
      case '-o':
        if (next) { result.output = next; i++; }
        break;
      case '--min-score':
        if (next) { result.minScore = parseInt(next, 10); i++; }
        break;
      case 'badge':
        result.badgeOnly = true;
        break;
      case '--badge-output':
        if (next) { result.badgeOutput = next; i++; }
        break;
    }
  }

  return result;
}

async function collectFiles(config: EcoLinterConfig, cwd: string): Promise<Array<{ path: string; content: string }>> {
  const patterns = config.include;
  const ignore = config.exclude;

  const filePaths = await glob(patterns, {
    cwd,
    ignore,
    absolute: true,
    nodir: true,
  });

  const files = await Promise.all(
    filePaths.map(async (filePath: string) => {
      const content = await readFile(filePath, 'utf-8');
      return { path: filePath, content };
    }),
  );

  return files;
}

async function run(): Promise<void> {
  const cliArgs = parseArgs(process.argv);

  const config = await loadConfig(cliArgs.cwd, cliArgs.configPath);

  if (cliArgs.minScore != null) config.minScore = cliArgs.minScore;
  if (cliArgs.format) config.reporter = cliArgs.format;

  if (cliArgs.badgeOnly) {
    const files = await collectFiles(config, cliArgs.cwd);
    const result = analyze(files, config);
    const badgeOutput = cliArgs.badgeOutput ?? config.badge.outputPath;
    const badgeDir = path.dirname(badgeOutput);

    if (!existsSync(badgeDir)) {
      await mkdir(badgeDir, { recursive: true });
    }

    const svg = generateBadge({
      label: 'eco-score',
      message: `${result.score.overall} ${result.score.grade}`,
      color: gradeToColor(result.score.grade),
      style: config.badge.style,
    });

    await writeFile(badgeOutput, svg, 'utf-8');
    console.log(`Badge written to ${badgeOutput}`);

    if (config.badge.autoUpdateReadme) {
      const readmePath = path.join(cliArgs.cwd, 'README.md');
      if (existsSync(readmePath)) {
        await updateReadmeBadge(readmePath, badgeOutput);
      }
    }

    return;
  }

  const files = await collectFiles(config, cliArgs.cwd);

  if (files.length === 0) {
    console.error('eco-linter: No files matched the include patterns. Check your config.');
    process.exit(3);
  }

  const result = analyze(files, config);
  const report = formatReport(result, config.reporter);

  if (cliArgs.output) {
    await writeFile(cliArgs.output, report, 'utf-8');
    console.log(`Report written to ${cliArgs.output}`);
  } else if (config.reporter === 'markdown') {
    const mdPath = path.join(cliArgs.cwd, 'eco-report.md');
    await writeFile(mdPath, report, 'utf-8');
    const { score, summary } = result;
    console.log(`\neco-linter — Carbon Score: ${score.overall}/100 [${score.grade}]  Est. CO₂e: ~${score.estimatedCO2ePerBuild}g/build`);
    console.log(`${summary.errorCount} errors · ${summary.warningCount} warnings · ${summary.infoCount} info`);
    console.log(`\nReport written to eco-report.md\n`);
  } else if (config.reporter === 'html') {
    const htmlPath = path.join(cliArgs.cwd, 'eco-report.html');
    await writeFile(htmlPath, report, 'utf-8');
    const { score, summary } = result;
    console.log(`\neco-linter — Carbon Score: ${score.overall}/100 [${score.grade}]  Est. CO₂e: ~${score.estimatedCO2ePerBuild}g/build`);
    console.log(`${summary.errorCount} errors · ${summary.warningCount} warnings · ${summary.infoCount} info`);
    console.log(`\nReport written to eco-report.html`);
    console.log(`Open with: open eco-report.html\n`);
  } else {
    process.stdout.write(report);
  }

  const hasErrors = result.summary.errorCount > 0;
  const belowMinScore = result.score.overall < config.minScore;

  if (hasErrors) {
    process.exit(2);
  } else if (belowMinScore) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

function gradeToColor(grade: string): string {
  const colors: Record<string, string> = {
    'A+': '#00c853',
    'A': '#64dd17',
    'B': '#ffd600',
    'C': '#ff6d00',
    'D': '#dd2c00',
    'F': '#b71c1c',
  };
  return colors[grade] ?? '#9e9e9e';
}

run().catch(err => {
  console.error('eco-linter: Fatal error:', err instanceof Error ? err.message : err);
  process.exit(3);
});
