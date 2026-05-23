const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: false,
  blockList: [
    /node_modules\/@opentelemetry\/.*/,
  ],
};
module.exports = config;
