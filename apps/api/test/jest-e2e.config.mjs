/** @type {import('jest').Config} */
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Recreates, migrates and seeds the *_test database once; refuses non-test databases.
  globalSetup: '<rootDir>/global-setup.ts',
  setupFiles: ['<rootDir>/setup-env.ts'],
};
