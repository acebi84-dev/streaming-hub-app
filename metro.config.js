const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: false,
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName.startsWith('@opentelemetry/')) {
      return {
        filePath: path.resolve(__dirname, 'mocks/opentelemetry.js'),
        type: 'sourceFile',
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
