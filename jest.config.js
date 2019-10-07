module.exports = {
  projects: ['<rootDir>/packages/*/jest.config.js'],
  preset: 'ts-jest',
  rootDir: './',
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/node_modules/`,
    `__tests__/fixtures`,
  ],
}
