/* eslint-disable import/no-named-as-default-member -- i18next default instance */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  APP_LOCALES,
  LOCALE_TAGS,
  resolveAppLocale,
  type AppLocale,
  type LocalePreference,
} from '@/i18n/locales';
import { de } from '@/i18n/resources/de';
import { en } from '@/i18n/resources/en';
import { es } from '@/i18n/resources/es';
import { fr } from '@/i18n/resources/fr';
import { pt } from '@/i18n/resources/pt';

export { APP_LOCALES, parseLocalePreference, resolveAppLocale } from '@/i18n/locales';
export type { AppLocale, LocalePreference } from '@/i18n/locales';

/**
 * Device language is injected from app code (`expo-localization`) so Node
 * unit tests never load react-native through that package.
 */
let readDeviceLanguage: () => string = () => 'en';

export function setDeviceLanguageReader(reader: () => string): void {
  readDeviceLanguage = reader;
}

function deviceLanguageCode(): string {
  try {
    return readDeviceLanguage() || 'en';
  } catch {
    return 'en';
  }
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      de: { translation: de },
      fr: { translation: fr },
    },
    lng: resolveAppLocale('system', deviceLanguageCode()),
    fallbackLng: 'en',
    supportedLngs: [...APP_LOCALES],
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });
}

export function currentAppLocale(): AppLocale {
  const lng = i18n.resolvedLanguage ?? i18n.language;
  return resolveAppLocale(isAppLocale(lng) ? lng : 'system', lng);
}

function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export function localeTag(locale: AppLocale = currentAppLocale()): string {
  return LOCALE_TAGS[locale];
}

export function applyAppLocale(preference: LocalePreference): AppLocale {
  const next = resolveAppLocale(preference, deviceLanguageCode());
  if (i18n.language !== next) {
    void i18n.changeLanguage(next);
  }
  return next;
}

export default i18n;
