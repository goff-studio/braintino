import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initAnalytics, trackScreen } from '@/services/analytics/analytics';
import { AppsFlyerService } from '@/services/attribution/AppsFlyerService';
import { initAudio } from '@/services/audio/audio';
import { AdService } from '@/services/monetization/AdService';
import { PurchaseService } from '@/services/monetization/PurchaseService';
import { initNotifications } from '@/services/notifications/notifications';
import { useGameStore } from '@/store/useGameStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const hydrated = useGameStore((s) => s.hydrated);
  const pathname = usePathname();

  useEffect(() => {
    initAudio();
    initNotifications();
    // Consent-aware boot: hydrate settings first so the stored "Analytics &
    // personalized content" choice gates Firebase and AppsFlyer from the very
    // first event. AdService.initialize() runs the single iOS ATT prompt at app
    // start (plus UMP/GDPR when required) before the ad SDK initializes;
    // AppsFlyer's initSdk waits for that ATT decision internally.
    useGameStore
      .getState()
      .hydrate()
      .then(() => {
        const { analyticsEnabled } = useGameStore.getState().settings;
        initAnalytics(analyticsEnabled);
        AppsFlyerService.initialize(analyticsEnabled);
        PurchaseService.initialize();
        // Ad-free purchasers skip the whole ad stack (including the iOS ATT
        // prompt). Show-time checks still guard the mid-session flip (e.g. a
        // refunded purchase re-enables ads on the next launch).
        if (!useGameStore.getState().adFree) AdService.initialize();
      });
  }, []);

  useEffect(() => {
    if (pathname) trackScreen(pathname);
  }, [pathname]);

  useEffect(() => {
    if (fontsLoaded && hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="calibration" options={{ gestureEnabled: false }} />
        <Stack.Screen name="daily" />
        <Stack.Screen name="play/[gameId]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="results" options={{ gestureEnabled: false }} />
        <Stack.Screen name="assessment" />
      </Stack>
    </GestureHandlerRootView>
  );
}
