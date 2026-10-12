import React, { createContext, useCallback, useContext, useState } from 'react';
import { translations } from './translations';
import type { Lang, TranslationKey } from './translations';

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Format a euro amount according to the current locale. */
  eur: (n: number) => string;
  pct: (n: number) => string;
  num: (n: number, digits?: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = 'ffc-lang';

const readLang = (): Lang => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'fr' || v === 'tr') return v;
  } catch { /* storage unavailable */ }
  return navigator.language?.startsWith('tr') ? 'tr' : 'fr';
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const locale = lang === 'fr' ? 'fr-FR' : 'tr-TR';
  const value: I18nValue = {
    lang,
    setLang,
    t: (key, vars) => {
      let s: string = translations[lang][key] ?? translations.fr[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    eur: n => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(n),
    pct: n => `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n)} %`,
    num: (n, digits = 2) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(n),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
};
