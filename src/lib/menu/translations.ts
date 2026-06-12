import type { Locale } from '@/lib/i18n/config';

const UI = {
  hy: {
    emptyCategory: 'Ապրանքներ չկան',
    noMenu: 'Ճաշացանկը հասանելի չէ',
  },
  ru: {
    emptyCategory: 'Нет позиций',
    noMenu: 'Меню недоступно',
  },
  en: {
    emptyCategory: 'No items available',
    noMenu: 'Menu not available',
  },
} as const;

export type UiTranslations = (typeof UI)[Locale];

export function getUiTranslations(locale: Locale): UiTranslations {
  return UI[locale] ?? UI.hy;
}
