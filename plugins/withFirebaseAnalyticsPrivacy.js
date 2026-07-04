const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * Disable Google Analytics Advertising ID (AAID) collection on Android.
 *
 * Firebase Analytics collects the Android Advertising ID by default, which would
 * count as an advertising identifier. Braintino only wants product analytics
 * (installs, sessions, retention, DAU/MAU) with no ads and no ad identifiers, so
 * we opt out via the documented manifest flag. The iOS equivalent is handled by
 * `withoutAdIdSupport` on the @react-native-firebase/analytics plugin.
 *
 * https://firebase.google.com/docs/analytics/configure-data-collection
 */
const withFirebaseAnalyticsPrivacy = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'google_analytics_adid_collection_enabled',
      'false',
    );
    return cfg;
  });
};

module.exports = withFirebaseAnalyticsPrivacy;
