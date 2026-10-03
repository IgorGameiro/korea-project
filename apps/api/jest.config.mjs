/** @type {import('jest').Config} */
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  // Unit tests for the app (src) and for the seed data (prisma/seed).
  roots: ['<rootDir>/src', '<rootDir>/prisma'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // The generated Prisma client uses NodeNext-style `./file.js` imports that point at .ts sources.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/generated/**', '!src/main.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
