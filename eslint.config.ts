import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';

// Rules that back the functional style described in README section 7.1.
// Formatting is Prettier's job: eslint-config-prettier switches off every
// rule that would conflict with it.
const functionalEverywhere = {
  plugins: { functional },
  rules: {
    'functional/no-classes': 'error',
    'functional/no-class-inheritance': 'error',
    'functional/no-this-expressions': 'error',
    'functional/no-let': ['error', { allowInFunctions: false }],
    'no-param-reassign': ['error', { props: true }],
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    eqeqeq: ['error', 'always'],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'Use Object.keys/entries instead.',
      },
    ],
  },
};

// The pure core: no mutation, no loops, no exceptions. Routes (server/api)
// are the impure shell and may throw createError. Mutation is caught with
// syntax selectors because eslint-plugin-functional's immutable-data needs
// TypeScript type information.
const pureCore = {
  files: ['server/utils/**/*.ts', 'shared/**/*.ts'],
  rules: {
    'functional/no-loop-statements': 'error',
    'functional/no-throw-statements': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'Use Object.keys/entries instead.',
      },
      {
        selector:
          'CallExpression[callee.property.name=/^(push|pop|shift|unshift|splice|sort|reverse|fill|copyWithin)$/]',
        message:
          'Return a new array (spread, map, filter, toSorted) instead of mutating.',
      },
      {
        selector: 'AssignmentExpression[left.type="MemberExpression"]',
        message: 'Return a new object ({ ...obj, key }) instead of mutating.',
      },
      {
        selector: 'UpdateExpression[argument.type="MemberExpression"]',
        message: 'Return a new object instead of mutating.',
      },
    ],
  },
};

const tests = {
  files: ['**/*.test.ts', 'tests/**/*.ts'],
  rules: {
    'functional/immutable-data': 'off',
    'functional/no-loop-statements': 'off',
    'functional/no-throw-statements': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'Use Object.keys/entries instead.',
      },
    ],
  },
};

// No HTML written from a text (Correction 23): none exists, and none may
// come, since a text someone typed would run as code.
const noRawHtml = { rules: { 'vue/no-v-html': 'error' } };

// Reference mockups of the redesign: never linted nor reformatted.
const mockups = { ignores: ['docs/refonte/maquettes/**'] };

export default withNuxt(
  mockups,
  functionalEverywhere,
  pureCore,
  tests,
  noRawHtml,
  prettier,
);
