export default [
  {
    files: ['**/*.js'],
    ignores: ['editor/lab/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        chrome: 'readonly',
        indexedDB: 'readonly',
        crypto: 'readonly',
        OffscreenCanvas: 'readonly',
        createImageBitmap: 'readonly',
        FileReader: 'readonly',
        ClipboardItem: 'readonly',
        alert: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
];
