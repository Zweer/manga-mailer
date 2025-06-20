import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
    overrides: {
      'style/brace-style': ['error', '1tbs'],
      'no-console': 'off',
      'no-new': 'off',
    },
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
}, {
  rules: {
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
  ignores: ['cdk.out/*'],
});
