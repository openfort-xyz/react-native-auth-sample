// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    settings: {
      // Keep eslint-config-expo's default (react-native ships Flow syntax the
      // import plugin can't parse) and add @expo/vector-icons, whose "exports"
      // map the plugin's node resolver can't read; TypeScript checks both.
      'import/ignore': ['react-native', '@expo/vector-icons'],
    },
  },
]);
