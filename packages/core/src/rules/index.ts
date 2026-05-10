import { noNestedArrayIterations } from './loop/no-nested-array-iterations.js';
import { preferForOfOverForEach } from './loop/prefer-for-of-over-foreach.js';
import { noRepeatedDomQueries } from './loop/no-repeated-dom-queries.js';
import { noPollingSetInterval } from './loop/no-polling-setinterval.js';
import { preferArrayDestructureSlice } from './loop/prefer-array-destructure-slice.js';
import { noHeavyMoment } from './dependency/no-heavy-moment.js';
import { preferDateFnsEsm } from './dependency/prefer-date-fns-esm.js';
import { noLodashFullImport } from './dependency/no-lodash-full-import.js';
import { preferNativeOverPolyfill } from './dependency/prefer-native-over-polyfill.js';
import { noSideEffectImports } from './tree-shake/no-side-effect-imports.js';
import { noBarrelReexports } from './tree-shake/no-barrel-reexports.js';
import { preferNamedExports } from './tree-shake/prefer-named-exports.js';
import { noExponentialRecursion } from './algorithm/no-exponential-recursion.js';
import { preferMapOverLinearFind } from './algorithm/prefer-map-over-linear-find.js';
import type { EcoRule } from '../types.js';

export const ALL_RULES: EcoRule[] = [
  // Loop efficiency
  noNestedArrayIterations,
  preferForOfOverForEach,
  noRepeatedDomQueries,
  noPollingSetInterval,
  preferArrayDestructureSlice,
  // Dependency health
  noHeavyMoment,
  preferDateFnsEsm,
  noLodashFullImport,
  preferNativeOverPolyfill,
  // Tree-shakability
  noSideEffectImports,
  noBarrelReexports,
  preferNamedExports,
  // Algorithmic complexity
  noExponentialRecursion,
  preferMapOverLinearFind,
];

export const RULES_BY_NAME: Map<string, EcoRule> = new Map(
  ALL_RULES.map(r => [r.name, r]),
);
