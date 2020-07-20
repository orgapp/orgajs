module.exports = {
  // projects: ['<rootDir>/packages/*/jest.config.js'],
  preset: 'ts-jest',
  rootDir: './',
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/node_modules/`,
    `__tests__/fixtures`,
  ],
  testMatch: [
    '**/__tests__/**/*.spec.ts',
  ],
  // Disabling diagnostics, TODO: turn this back on
  // globals: {
  //   'ts-jest': {
  //     diagnostics: false
  //   }
  // },
}
