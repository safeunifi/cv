const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Inject crypto.getRandomValues polyfill before any other module loads.
// This ensures the uuid package (transitive dep) captures the polyfill
// reference when its module factory runs.
config.serializer = {
  ...config.serializer,
  getPolyfills: () => {
    const defaultPolyfills = require('@react-native/js-polyfills')();
    return [...defaultPolyfills, path.resolve(__dirname, 'polyfills.js')];
  },
};

module.exports = config;
