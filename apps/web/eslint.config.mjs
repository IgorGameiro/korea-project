import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { prettierConfig } from '../../eslint.config.base.mjs';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Lets @next/eslint-plugin-next find the app when ESLint runs from the repo root (lint-staged).
  { settings: { next: { rootDir: import.meta.dirname } } },
  prettierConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
]);
