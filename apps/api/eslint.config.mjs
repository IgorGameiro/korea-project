import globals from 'globals';
import tseslint from 'typescript-eslint';
import { baseConfig, prettierConfig } from '../../eslint.config.base.mjs';

export default [
  { ignores: ['eslint.config.mjs', 'jest.config.mjs', 'test/jest-e2e.config.mjs'] },
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parserOptions: {
        // prisma.config.ts is loaded by the Prisma CLI, not compiled with the app.
        projectService: { allowDefaultProject: ['prisma.config.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Nest relies on decorated classes whose imports are only used as types at runtime metadata.
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  prettierConfig,
];
