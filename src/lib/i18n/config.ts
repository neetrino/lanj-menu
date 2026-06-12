export const locales = ['hy', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'hy';

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
