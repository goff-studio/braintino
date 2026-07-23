// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * react-native-google-mobile-ads is native-only — it imports react-native
 * internals that Metro refuses to bundle for web, which breaks `expo export`
 * (and therefore `eas update`, which exports all platforms). Resolve it to an
 * empty module on web; the runtime guard in src/services/monetization/admob.ts
 * already no-ops when the native module is absent.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-google-mobile-ads') {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
