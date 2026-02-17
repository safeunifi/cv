const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Redirect all uuid imports to a shim that works without crypto.getRandomValues.
// The uuid npm package (transitive dep via xcode -> @expo/config-plugins) fails
// in React Native because Hermes doesn't provide crypto.getRandomValues.
const uuidShim = path.resolve(__dirname, 'shims', 'uuid.js');
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'uuid' || moduleName.startsWith('uuid/')) {
    return { filePath: uuidShim, type: 'sourceFile' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
