const fs = require('fs');

module.exports = {
  parser: 'babel-eslint',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:react-hooks/recommended',
  ],
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  globals: {
    NETLIFY_CMS_VERSION: false,
    NETLIFY_CMS_APP_VERSION: false,
    NETLIFY_CMS_CORE_VERSION: false,
    CMS_ENV: false,
  },
  plugins: ['babel', '@emotion', 'unicorn'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
      ],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: {
        'no-duplicate-imports': [0], // handled by @typescript-eslint
        '@typescript-eslint/ban-types': [0], // TODO enable in future
        '@typescript-eslint/no-non-null-assertion': [0],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-function-return-type': [0],
        '@typescript-eslint/explicit-module-boundary-types': [0],
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/no-use-before-define': [
          'error',
          { functions: false, classes: true, variables: true },
        ],
      },
    },
  ],
};
