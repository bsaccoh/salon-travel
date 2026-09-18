/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        diagnostics: { ignoreDiagnostics: [6059, 18003] },
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/worker.ts',
    '!src/scheduler.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000,
  setupFiles: ['<rootDir>/tests/helpers/setup.ts'],
};

module.exports = config;
