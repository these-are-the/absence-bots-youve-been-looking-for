import type { Language } from './config';
import { isValidLanguage } from './config';
import { en } from './translations/en';
import { sl } from './translations/sl';
import { de } from './translations/de';

export type TranslationKey = keyof typeof en;

const translations = {
  en,
  sl,
  de,
};

export function getTranslation(lang: Language = 'en') {
  const language = isValidLanguage(lang) ? lang : 'en';
  return translations[language];
}

export function t(key: string, lang: Language = 'en'): string {
  const translation = getTranslation(lang);
  const keys = key.split('.');
  let value: any = translation;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export type { Language };
export { isValidLanguage };
