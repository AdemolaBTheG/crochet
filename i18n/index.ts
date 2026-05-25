import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ptBR from './locales/pt-BR.json';
import sv from './locales/sv.json';

const SUPPORTED_LANGUAGES = [
  'en',
  'de',
  'fr',
  'es',
  'nl',
  'it',
  'ja',
  'ko',
  'pt-BR',
  'pl',
  'sv',
] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  nl: { translation: nl },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  'pt-BR': { translation: ptBR },
  pl: { translation: pl },
  sv: { translation: sv },
} as const;

function normalizeLanguage(value: string | null | undefined): SupportedLanguage | null {
  if (!value) return null;

  if (value === 'pt-BR' || value.toLowerCase() === 'pt-br' || value.toLowerCase() === 'pt') {
    return 'pt-BR';
  }

  if (SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)) {
    return value as SupportedLanguage;
  }

  const lower = value.toLowerCase();
  const base = lower.split('-')[0];

  if (SUPPORTED_LANGUAGES.includes(base as SupportedLanguage)) {
    return base as SupportedLanguage;
  }

  return null;
}

function getDeviceLanguage(): SupportedLanguage {
  const locales = Localization.getLocales();
  const preferredLocale = locales[0];
  const candidate =
    normalizeLanguage(preferredLocale?.languageTag) ??
    normalizeLanguage(preferredLocale?.languageCode);

  if (candidate) {
    return candidate;
  }

  return 'en';
}

export const defaultNS = 'translation';

export function changeAppLanguage(language: SupportedLanguage) {
  void i18n.changeLanguage(language);
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    nonExplicitSupportedLngs: true,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });
}

export default i18n;
