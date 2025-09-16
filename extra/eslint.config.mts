import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      curly: 'error',
      'no-debugger': 'error',
      'no-empty': 'warn',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'dot-notation': 'warn',
      'no-multi-spaces': 'warn',
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
  tseslint.configs.recommended,
]);
