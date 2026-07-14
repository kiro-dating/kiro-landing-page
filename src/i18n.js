import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/* Locales par défaut, embarquées dans le bundle initial */
import fr from './locales/fr/translation.json';
import en from './locales/en/translation.json';

/* Fusion profonde : les variantes régionales ne contiennent que
   les clés qui diffèrent de leur langue de base */
const merge = (base, overrides) => {
  const out = { ...base };
  for (const [key, value] of Object.entries(overrides || {})) {
    out[key] =
      value && typeof value === 'object' && !Array.isArray(value)
        ? merge(base[key] || {}, value)
        : value;
  }
  return out;
};

/* Locales secondaires : chargées à la demande (code-splitting Vite) */
const LAZY_LOCALES = {
  'fr-FR': async () => merge(fr, (await import('./locales/fr-FR/overrides.json')).default),
  'en-GB': async () => merge(en, (await import('./locales/en-GB/overrides.json')).default),
  'es-ES': async () => (await import('./locales/es/translation.json')).default,
  'es-MX': async () => {
    const es = (await import('./locales/es/translation.json')).default;
    return merge(es, (await import('./locales/es-MX/overrides.json')).default);
  },
  ht: async () => (await import('./locales/ht/translation.json')).default,
  'pt-BR': async () => (await import('./locales/pt-BR/translation.json')).default,
  de: async () => (await import('./locales/de/translation.json')).default,
  it: async () => (await import('./locales/it/translation.json')).default,
};

/* Change la langue en chargeant la locale au besoin */
export const setLanguage = async (code) => {
  if (!i18n.hasResourceBundle(code, 'translation') && LAZY_LOCALES[code]) {
    const bundle = await LAZY_LOCALES[code]();
    i18n.addResourceBundle(code, 'translation', bundle, true, true);
  }
  return i18n.changeLanguage(code);
};

const saved =
  typeof window !== 'undefined' ? window.localStorage.getItem('kiro-lang') : null;

i18n.use(initReactI18next).init({
  resources: {
    'fr-CA': { translation: fr },
    'en-US': { translation: en },
    /* Anciens codes conservés pour compatibilité */
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: 'fr-CA',
  fallbackLng: 'fr-CA',
  supportedLngs: ['fr-CA', 'fr-FR', 'en-US', 'en-GB', 'es-ES', 'es-MX', 'ht', 'pt-BR', 'de', 'it', 'fr', 'en', 'es'],
  interpolation: { escapeValue: false },
});

/* <html lang> suit toujours la langue affichée (accessibilité + SEO) */
if (typeof document !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
  });
  document.documentElement.lang = i18n.language;
}

/* Restaure la langue mémorisée (chargement différé si nécessaire) */
if (saved && saved !== 'fr-CA') {
  setLanguage(saved);
}

export default i18n;
