module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './tsconfig.tests.json',
    ],
  },
  plugins: [
    '@stylistic',
    '@typescript-eslint',
  ],
  root: true,
  ignorePatterns: [
    'dist/**',
  ],
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@stylistic/object-curly-spacing': ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
  },
};
