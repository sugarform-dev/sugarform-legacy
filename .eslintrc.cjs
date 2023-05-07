module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
  ],
  ignorePatterns: [ 'dist/**/*', 'coverage/**/*' ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    'jest',
    '@typescript-eslint',
    'import',
    'unused-imports',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {

    /* Code Styles */
    'indent': [ 'error', 2 ],
    'linebreak-style': [ 'error', 'unix' ],
    'quotes': [ 'error', 'single' ],
    'jsx-quotes': [ 'error', 'prefer-single' ],
    'semi': [ 'error', 'always' ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'no-trailing-spaces': [ 'error' ],
    'camelcase': [ 'error' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always', { arraysInArrays: false, objectsInArrays: false }],
    'block-spacing': [ 'error', 'always' ],
    'space-infix-ops': [ 'error' ],
    'space-before-blocks': [ 'error', 'always' ],
    'spaced-comment': [ 'error', 'always' ],
    'brace-style': [ 'error', '1tbs', { allowSingleLine: true }],
    'keyword-spacing': [ 'error', { before: true, after: true }],
    'arrow-spacing': [ 'error', { before: true, after: true }],
    'func-call-spacing': [ 'error', 'never' ],
    'function-call-argument-newline': [ 'error', 'consistent' ],
    'dot-location': [ 'error', 'property' ],
    'dot-notation': [ 'error' ],
    '@typescript-eslint/array-type': [ 'error', { default: 'array-simple', readonly: 'array-simple' }],
    '@typescript-eslint/prefer-for-of': [ 'error' ],
    '@typescript-eslint/prefer-includes': [ 'error' ],

    // This enable the TypeScript compiler to perform the type processing s in a lightweight.
    '@typescript-eslint/explicit-function-return-type': [ 'error' ],

    // RegExp#exec may also be slightly faster than String#match.
    '@typescript-eslint/prefer-regexp-exec': [ 'error' ],

    /* Jest */
    'jest/consistent-test-it': [ 'error', { fn: 'it' }],
    'jest/prefer-expect-resolves': [ 'error' ],
    'jest/prefer-spy-on': [ 'error' ],
    'jest/prefer-to-be': [ 'error' ],
    'jest/prefer-strict-equal': [ 'error' ],
    'jest/prefer-todo': [ 'error' ],

    'no-restricted-globals': [
      'error',
      ...[
        'it', 'test',
        'fix', 'xit', 'xtest',
        'describe', 'xdescribe', 'fdescribe',
        'beforeAll', 'beforeEach', 'afterEach', 'afterAll',
      ].map(name => ({
        name,
        message: 'Please import from @jest/globals instead.',
      })),
    ],


    /* import and export */
    'no-restricted-exports': [ 'error', { restrictDefaultExports: { direct: true, defaultFrom: true, namedFrom: true } }],
    '@typescript-eslint/consistent-type-imports': [ 'error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
    '@typescript-eslint/no-require-imports': [ 'error' ],
    'import/consistent-type-specifier-style': [ 'error', 'prefer-top-level' ],
    'import/no-absolute-path': [ 'error' ],
    'import/no-relative-parent-imports': [ 'error' ],
    'import/no-empty-named-blocks': [ 'error' ],
    'import/no-duplicates': [ 'error' ],
    'import/no-cycle': [ 'error' ],
    'unused-imports/no-unused-imports': [ 'error' ],

    /* Maintainability */
    'complexity': [ 'warn', 10 ],
    'max-classes-per-file': [ 'warn', 1 ],
    'max-depth': [ 'warn', 3 ],
    'max-len': [ 'warn', { code: 100, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'max-lines-per-function': [ 'warn', 100 ],
    'no-multi-str': [ 'warn' ],
    'object-shorthand': [ 'warn' ],
    'prefer-template': [ 'warn' ],
    '@typescript-eslint/explicit-member-accessibility': [ 'error', { overrides: { constructors: 'off' } }],
    '@typescript-eslint/no-redundant-type-constituents': [ 'error' ],

    /* Best Practices */
    'no-console': [ 'warn' ],
    'no-alert': [ 'error' ],
    'no-eval': [ 'error' ],
    'no-var': [ 'error' ],
    'radix': [ 'error' ],
    'require-await': [ 'error' ],
    'no-constructor-return': [ 'error' ],
    'no-promise-executor-return': [ 'error' ],
    'no-self-compare': [ 'error' ],
    'no-unmodified-loop-condition': [ 'error' ],
    'no-unused-private-class-members': [ 'error' ],
    'no-param-reassign': [ 'error' ],
    'no-return-assign': [ 'error' ],
    'no-return-await': [ 'error' ],
    'eqeqeq': [ 'error', 'always' ],
    'prefer-const': [ 'warn' ],

  },
};
