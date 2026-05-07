import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Per-feature locale files at src/locales/<lang>/<namespace>.json. Vite's
// import.meta.glob with `eager: true` inlines them all at build time, so
// adding a feature is just dropping a new JSON file — no edits here.
const localeModules = import.meta.glob('./locales/*/*.json', { eager: true });

const resources = {};
for (const filePath in localeModules) {
  const match = filePath.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, lang, namespace] = match;
  if (!resources[lang]) resources[lang] = { translation: {} };
  resources[lang].translation[namespace] = localeModules[filePath].default;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
