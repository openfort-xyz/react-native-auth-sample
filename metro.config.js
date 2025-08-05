const { getDefaultConfig } = require('expo/metro-config');

// sample metro.config.js
module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Add shims for Node.js modules like crypto and stream
  config.resolver.extraNodeModules = {
    crypto: require.resolve('react-native-crypto'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
  };

  return config;
})();
