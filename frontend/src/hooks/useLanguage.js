import { useState, useCallback } from 'react';
import { TRANSLATIONS } from '../i18n/translations.js';

export function useLanguage(initialLang = 'en') {
  const [lang, setLang] = useState(initialLang);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'th' : 'en'));
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return { lang, setLang, toggleLanguage, t };
}
