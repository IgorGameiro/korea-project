// Root config: only lints loose files at the repository root.
// Workspace packages are linted with their own eslint.config.mjs (ESLint resolves the nearest one).
import globals from 'globals';
import { baseConfig, prettierConfig } from './eslint.config.base.mjs';

export default [
  { ignores: ['apps/**', 'packages/**'] },
  ...baseConfig,
  { languageOptions: { globals: globals.node } },
  prettierConfig,
];
