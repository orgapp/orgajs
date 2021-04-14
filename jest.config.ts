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

export default {
  // projects: ['<rootDir>/packages/*/jest.config.js'],
  preset: 'ts-jest/presets/js-with-ts',
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules}).+/`,
    `/examples/`,
    `/www/`,
    `/dist/`,
    `__tests__/fixtures`,
  ],
  rootDir: './',
  testMatch: [
    '**/__tests__/**/*.spec.ts',
    '**/tests/**/*.spec.ts',
  ],
  // Disabling diagnostics, TODO: turn this back on
  // globals: {
  //   'ts-jest': {
  //     // useESM: true,
  //     // diagnostics: false
  //   }
  // },
}
