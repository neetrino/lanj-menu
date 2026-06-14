import type { Locale } from '@/lib/i18n/config';

const UI = {
  hy: {
    goodDay: 'Բարի օր',
    headingLine1: 'Ինչ կցանկանաք',
    headingLine2: 'այսօր?',
    emptyCategory: 'Ապրանքներ չկան',
    noMenu: 'Ճաշացանկը հասանելի չէ',
  },
  ru: {
    goodDay: 'Добрый день',
    headingLine1: 'Что вы хотите',
    headingLine2: 'сегодня?',
    emptyCategory: 'Нет позиций',
    noMenu: 'Меню недоступно',
  },
  en: {
    goodDay: 'Good day',
    headingLine1: 'What would you',
    headingLine2: 'like today?',
    emptyCategory: 'No items available',
    noMenu: 'Menu not available',
  },
} as const;

export type UiTranslations = (typeof UI)[Locale];

export function getUiTranslations(locale: Locale): UiTranslations {
  return UI[locale] ?? UI.hy;
}
