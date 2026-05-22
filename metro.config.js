const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: false,
};
module.exports = config;
