import { useState, useCallback, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations.js';

export function useLanguage(initialLang = 'en') {
  const [lang, setLang] = useState(initialLang);

  // Sync <html lang="..."> so screen readers & browsers match displayed human language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'th' : 'en'));
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return { lang, setLang, toggleLanguage, t };
}
