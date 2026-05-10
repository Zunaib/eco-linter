import { cosmiconfig } from 'cosmiconfig';
import type { EcoLinterConfig } from './types.js';
import { DEFAULT_CONFIG } from './types.js';

const MODULE_NAME = 'eco-linter';

export async function loadConfig(
  searchFrom?: string,
  configPath?: string,
): Promise<EcoLinterConfig> {
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

  try {
    const result = configPath
      ? await explorer.load(configPath)
      : await explorer.search(searchFrom);

    if (!result) return DEFAULT_CONFIG;

    return mergeConfig(DEFAULT_CONFIG, result.config as Partial<EcoLinterConfig>);
  } catch {
    return DEFAULT_CONFIG;
  }
}

function mergeConfig(
  base: EcoLinterConfig,
  override: Partial<EcoLinterConfig>,
): EcoLinterConfig {
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
