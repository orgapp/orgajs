module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx', '.d.ts'],
        paths: ['node_modules/', 'node_modules/@types/'],
      },
    },
  },
  rules: {
    'import/no-extraneous-dependencies': ['warn'],
    semi: ['error', 'never'],
  },
  overrides: [
    {
      files: ['**.ts', '**.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/recommended',
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
      plugins: ['@typescript-eslint', 'import'],
      rules: {
        'no-dupe-class-members': 'off',
        'no-undef': 'off',
        // TODO: remove this eventually
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],
}
