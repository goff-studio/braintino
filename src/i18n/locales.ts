export const APP_LOCALES = ['en', 'es', 'pt', 'de', 'fr'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export type LocalePreference = 'system' | AppLocale;

export const LOCALE_TAGS: Record<AppLocale, string> = {
  en: 'en-US',
  es: 'es',
  pt: 'pt-BR',
  de: 'de',
  fr: 'fr',
};

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (APP_LOCALES as readonly string[]).includes(value);
}

export function parseLocalePreference(value: unknown): LocalePreference {
  if (value === 'system') return 'system';
  if (isAppLocale(value)) return value;
  return 'system';
}

/** Map a device language code (`es`, `pt-BR`, `de-DE`) onto a supported app locale. */
export function resolveAppLocale(
  preference: LocalePreference,
  languageCode: string | null | undefined
): AppLocale {
  if (preference !== 'system' && isAppLocale(preference)) return preference;
  const code = (languageCode ?? 'en').toLowerCase();
  if (code.startsWith('es')) return 'es';
  if (code.startsWith('pt')) return 'pt';
  if (code.startsWith('de')) return 'de';
  if (code.startsWith('fr')) return 'fr';
  return 'en';
}
