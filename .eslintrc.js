module.exports = {
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx', '.d.ts'],
        paths: [ 'node_modules/', 'node_modules/@types/' ]
      }
    }
  },
  rules: {
    'import/no-extraneous-dependencies': ['warn'],
    'semi': ['error', 'never'],
  },
  // overrides: [
  //   {
  //     files: ['**/*.ts', '**/*.tsx'],
  //     parser: '@typescript-eslint/parser',
  //     parserOptions: {
  //       ecmaVersion: 2018,
  //       sourceType: 'module',
  //       ecmaFeatures: {
  //         jsx: true,
  //       },
  //     },
  //     plugins: ['@typescript-eslint'],
  //     rules: {
  //       'no-dupe-class-members': 'off',
  //       'no-undef': 'off',
  //     }
  //   },
  // ],
}
