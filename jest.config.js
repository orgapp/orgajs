const esModules = [
  'unist-util-position-from-estree',
  'estree-walker',
  'periscopic',
  'remark-mdx-frontmatter',
  'js-yaml',
  'estree-util-is-identifier-name',
  'zwitch',
  'comma-separated-tokens',
].join('|')

module.exports = {
  // projects: ['<rootDir>/packages/*/jest.config.js'],
  verbose: true,
  preset: 'ts-jest/presets/js-with-ts',
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules}).+/`,
    `/examples/`,
    `/www/`,
    `/dist/`,
    `__tests__/fixtures`,
  ],
  rootDir: './',
  testMatch: ['**/*.test.ts'],
  // Disabling diagnostics, TODO: turn this back on
  // globals: {
  //   'ts-jest': {
  //     // useESM: true,
  //     // diagnostics: false
  //   }
  // },
}
