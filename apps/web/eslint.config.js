// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';

export default tseslint.config(
  // --- IGNORE BUILD ARTIFACTS ---
  { ignores: ['dist', 'coverage', 'node_modules'] },

  // --- MAIN TS / TSX CONFIG ---
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      // Type-aware, strict TS rules
      ...tseslint.configs.strictTypeChecked,
      // Stylistic TS rules
      ...tseslint.configs.stylisticTypeChecked,
      // Turn off formatting rules that conflict with Prettier
      prettierConfig,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      prettier: prettierPlugin,
    },

    rules: {
      // -------------------------------------------------------
      // PRETTIER – formatting source of truth
      // -------------------------------------------------------
      'prettier/prettier': 'error',

      // -------------------------------------------------------
      // REACT / REACT HOOKS
      // -------------------------------------------------------
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // -------------------------------------------------------
      // IMPORTS / MODULE BOUNDARIES
      // -------------------------------------------------------
      // Use ESLint for import sorting (no Prettier sort plugin)
      'simple-import-sort/imports': [
        'warn', // downgraded from error
        {
          groups: [
            ['^react', '^@?\\w'], // packages
            ['^@/'], // internal alias
            ['^\\.\\.'], // parent
            ['^\\.'], // sibling
            ['^.+\\.?(css|scss)$'], // styles
          ],
        },
      ],
      'simple-import-sort/exports': 'warn', // downgraded from error

      // Let unused-imports own this space
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // -------------------------------------------------------
      // TYPESCRIPT – STRUCTURE & STYLE
      // -------------------------------------------------------
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',

      // Member ordering / alphabetizing → now warnings
      '@typescript-eslint/member-ordering': [
        'warn',
        {
          default: {
            memberTypes: [
              'signature',
              'call-signature',
              'public-static-field',
              'protected-static-field',
              'private-static-field',
              '#private-static-field',
              'public-decorated-field',
              'protected-decorated-field',
              'private-decorated-field',
              'public-instance-field',
              'protected-instance-field',
              'private-instance-field',
              '#private-instance-field',
              'public-abstract-field',
              'protected-abstract-field',
              'public-field',
              'protected-field',
              'private-field',
              '#private-field',
              'static-field',
              'instance-field',
              'abstract-field',
              'decorated-field',
              'field',
              'static-initialization',
              'public-constructor',
              'protected-constructor',
              'private-constructor',
              'constructor',
              ['public-static-get', 'public-static-set'],
              ['protected-static-get', 'protected-static-set'],
              ['private-static-get', 'private-static-set'],
              ['#private-static-get', '#private-static-set'],
              ['public-decorated-get', 'public-decorated-set'],
              ['protected-decorated-get', 'protected-decorated-set'],
              ['private-decorated-get', 'private-decorated-set'],
              ['public-instance-get', 'public-instance-set'],
              ['protected-instance-get', 'protected-instance-set'],
              ['private-instance-get', 'private-instance-set'],
              ['#private-instance-get', '#private-instance-set'],
              ['public-abstract-get', 'public-abstract-set'],
              ['protected-abstract-get', 'protected-abstract-set'],
              ['public-get', 'public-set'],
              ['protected-get', 'protected-set'],
              ['private-get', 'private-set'],
              ['#private-get', '#private-set'],
              ['static-get', 'static-set'],
              ['instance-get', 'instance-set'],
              ['abstract-get', 'abstract-set'],
              ['decorated-get', 'decorated-set'],
              ['get', 'set'],
              'public-static-method',
              'protected-static-method',
              'private-static-method',
              '#private-static-method',
              'public-decorated-method',
              'protected-decorated-method',
              'private-decorated-method',
              'public-instance-method',
              'protected-instance-method',
              'private-instance-method',
              '#private-instance-method',
              'public-abstract-method',
              'protected-abstract-method',
              'public-method',
              'protected-method',
              'private-method',
              '#private-method',
              'static-method',
              'instance-method',
              'abstract-method',
              'decorated-method',
              'method',
            ],
            order: 'alphabetically',
          },
        },
      ],

      // Interface/union constituent sorting → warning
      '@typescript-eslint/sort-type-constituents': 'warn',

      '@typescript-eslint/adjacent-overload-signatures': 'error',

      // -------------------------------------------------------
      // DATA & RUNTIME SAFETY (trimmed a bit per your prefs)
      // -------------------------------------------------------

      // Don’t silently drop async work
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false, ignoreIIFE: true }],

      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksConditionals: true,
          checksVoidReturn: { attributes: false, properties: false },
        },
      ],

      // Keep most unsafe guards, but allow unsafe arguments (per your note)
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off', // <– turned off

      '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',

      // You explicitly *don’t* want strict boolean expression policing
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // And you like double-bangs
      'no-extra-boolean-cast': 'off',

      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignoreTernaryTests: true,
          ignoreConditionalTests: true,
          ignoreMixedLogicalExpressions: true,
        },
      ],
      '@typescript-eslint/prefer-optional-chain': 'error',

      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: false,
          allowAny: false,
          allowNullish: false,
        },
      ],

      '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],

      // Allow any, per TanStack Form / etc
      '@typescript-eslint/no-explicit-any': 'off',

      // Don’t force Error-only throws
      '@typescript-eslint/only-throw-error': 'off',

      // -------------------------------------------------------
      // GENERAL JS QUALITY
      // -------------------------------------------------------
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
    },
  },

  // --- TEST OVERRIDES: Vitest + Testing Library ---
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],

    plugins: {
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
    },

    extends: [
      // React Testing Library rules
      testingLibrary.configs.react,
      // jest-dom matcher rules (Vitest + @testing-library/jest-dom)
      jestDom.configs.recommended,
    ],

    languageOptions: {
      globals: {
        ...globals.node,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },

    rules: {
      // Tests can be looser
      'no-console': 'off',

      '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: true, ignoreIIFE: true }],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',

      // Testing Library nudges
      'testing-library/prefer-screen-queries': 'error',
      'testing-library/prefer-user-event': 'warn',
      'testing-library/prefer-find-by': 'warn',
    },
  }
);
