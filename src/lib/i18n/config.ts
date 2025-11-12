export type Language = 'en' | 'sl' | 'de';

export const supportedLanguages: Language[] = ['en', 'sl', 'de'];

export const languageNames: Record<Language, string> = {
  en: 'English',
  sl: 'Slovenščina',
  de: 'Deutsch',
};

export function isValidLanguage(lang: string): lang is Language {
  return supportedLanguages.includes(lang as Language);
}
