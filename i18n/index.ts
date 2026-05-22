import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import nl from './locales/nl.json';

const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'nl', 'it', 'ja'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  nl: { translation: nl },
  it: { translation: it },
  ja: { translation: ja },
} as const;

function getDeviceLanguage(): SupportedLanguage {
  const locales = Localization.getLocales();
  const candidate = locales[0]?.languageCode?.toLowerCase();

  if (candidate && SUPPORTED_LANGUAGES.includes(candidate as SupportedLanguage)) {
    return candidate as SupportedLanguage;
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
