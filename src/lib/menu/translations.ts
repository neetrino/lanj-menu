import type { Locale } from '@/lib/i18n/config';

const UI = {
  hy: {
    heading: 'Ինչ կցանկանաք այսօր?',
    emptyCategory: 'Ապրանքներ չկան',
    noMenu: 'Ճաշացանկը հասանելի չէ',
  },
  ru: {
    heading: 'Что вы хотите сегодня?',
    emptyCategory: 'Нет позиций',
    noMenu: 'Меню недоступно',
  },
  en: {
    heading: 'What would you like today?',
    emptyCategory: 'No items available',
    noMenu: 'Menu not available',
  },
} as const;

export type UiTranslations = (typeof UI)[Locale];

export function getUiTranslations(locale: Locale): UiTranslations {
  return UI[locale] ?? UI.hy;
}
