import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';

export default antfu({
  react: true,
  stylistic: {
    semi: true,
    overrides: {
      'style/brace-style': ['error', '1tbs'],
      'no-console': 'off',
    },
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
}, {
  plugins: {
    '@next/next': nextPlugin,
  },
}, {
  rules: {
    'node/prefer-global/process': 'off',
    'perfectionist/sort-imports': ['error', {
      internalPattern: ['^~/.+', '^@/.+', '^#.+'],
      groups: [
        'type',
        ['parent-type', 'sibling-type', 'index-type', 'internal-type'],
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'side-effect',
        'object',
        'unknown',
      ],
    }],
  },
}, {
  rules: {
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-return': 'off',
  },
  files: ['test/setup.ts', '**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
}, {
  ignores: ['.next/*', './components/ui/*.tsx'],
});
