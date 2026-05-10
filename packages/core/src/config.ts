import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { cosmiconfig } from 'cosmiconfig';
import type { EcoLinterConfig } from './types.js';
import { DEFAULT_CONFIG } from './types.js';

const MODULE_NAME = 'eco-linter';

async function readPackageSideEffects(
  cwd: string,
): Promise<boolean | string[] | undefined> {
  try {
    const raw = await readFile(path.join(cwd, 'package.json'), 'utf-8');
    const pkg = JSON.parse(raw) as Record<string, unknown>;
    const se = pkg['sideEffects'];
    if (typeof se === 'boolean' || Array.isArray(se)) return se as boolean | string[];
    return undefined;
  } catch {
    return undefined;
  }
}

export async function loadConfig(
  searchFrom?: string,
  configPath?: string,
): Promise<EcoLinterConfig> {
  const cwd = searchFrom ?? process.cwd();

  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      'package.json',
      `.${MODULE_NAME}rc`,
      `.${MODULE_NAME}rc.json`,
      `.${MODULE_NAME}rc.yaml`,
      `.${MODULE_NAME}rc.yml`,
      `.${MODULE_NAME}rc.js`,
      `.${MODULE_NAME}rc.cjs`,
      `.${MODULE_NAME}rc.mjs`,
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.cjs`,
      `${MODULE_NAME}.config.mjs`,
      `${MODULE_NAME}.config.ts`,
    ],
  });

  let merged: EcoLinterConfig;
  try {
    const result = configPath
      ? await explorer.load(configPath)
      : await explorer.search(cwd);

    merged = result
      ? mergeConfig(DEFAULT_CONFIG, result.config as Partial<EcoLinterConfig>)
      : DEFAULT_CONFIG;
  } catch {
    merged = DEFAULT_CONFIG;
  }

  // Populate sideEffects from the project's package.json unless already set in config
  if (merged.sideEffects === undefined) {
    const sideEffects = await readPackageSideEffects(cwd);
    if (sideEffects !== undefined) {
      merged = { ...merged, sideEffects };
    }
  }

  return merged;
}

function mergeConfig(base: EcoLinterConfig, override: Partial<EcoLinterConfig>): EcoLinterConfig {
  return {
    ...base,
    ...override,
    badge: { ...base.badge, ...override.badge },
    rules: { ...base.rules, ...override.rules },
  };
}

export function defineConfig(config: Partial<EcoLinterConfig>): Partial<EcoLinterConfig> {
  return config;
}
