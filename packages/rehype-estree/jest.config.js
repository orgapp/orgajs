export default {
  // projects: ['<rootDir>/packages/*/jest.config.js'],
  preset: 'ts-jest/presets/default-esm',
  transform: {
    // '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  rootDir: './',
  testMatch: ['/**/*.test.ts'],
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  // Disabling diagnostics, TODO: turn this back on
  globals: {
    'ts-jest': {
      useESM: true,
      // diagnostics: false
    },
  },
}
