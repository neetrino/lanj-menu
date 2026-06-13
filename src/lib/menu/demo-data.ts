import type { Locale } from '@/lib/i18n/config';
import type { MenuPayload } from './types';

type T = Record<Locale, string>;

function mk(hy: string, ru: string, en: string): T {
  return { hy, ru, en };
}

const DEMO_SECTIONS = [
  {
    slug: 'pool-menu',
    title: mk('Բasseinի Menyu', 'Меню Бассейна', 'Pool Menu'),
    categories: [
      {
        slug: 'bar-menu',
        title: mk('Barի Menyu', 'Меню Бара', 'Bar Menu'),
        items: [
          {
            slug: 'demo-drink-1',
            name: mk('Demo Drink 1', 'Демо Напиток 1', 'Demo Drink 1'),
            imageUrl: null,
            price: 2500,
          },
        ],
      },
      {
        slug: 'kitchen',
        title: mk('Խոհանոց', 'Кухня', 'Kitchen'),
        items: [
          {
            slug: 'demo-dish-1',
            name: mk('Demo Dish 1', 'Демо Блюдо 1', 'Demo Dish 1'),
            imageUrl: null,
            price: 3500,
          },
        ],
      },
    ],
  },
  {
    slug: 'restaurant',
    title: mk('Ռestoran', 'Ресторан', 'Restaurant'),
    categories: [
      {
        slug: 'daily-menu',
        title: mk('Orhva Menyu', 'Дневное Меню', 'Daily Menu'),
        items: [
          {
            slug: 'demo-dish-2',
            name: mk('Demo Dish 2', 'Демо Блюдо 2', 'Demo Dish 2'),
            imageUrl: null,
            price: 4500,
          },
        ],
      },
      {
        slug: 'bar-menu',
        title: mk('Barի Menyu', 'Меню Бара', 'Bar Menu'),
        items: [
          {
            slug: 'demo-drink-2',
            name: mk('Demo Drink 2', 'Демо Напиток 2', 'Demo Drink 2'),
            imageUrl: null,
            price: 1800,
          },
        ],
      },
      {
        slug: 'cocktails',
        title: mk('Կոkteyller', 'Коктейли', 'Cocktails'),
        items: [
          {
            slug: 'demo-cocktail',
            name: mk('Demo Cocktail', 'Демо Коктейль', 'Demo Cocktail'),
            imageUrl: null,
            price: 5500,
          },
        ],
      },
      {
        slug: 'soft-drinks',
        title: mk('Chshy Chamsher', 'Безалкогольные', 'Soft Drinks'),
        items: [
          {
            slug: 'demo-soft-drink',
            name: mk('Demo Soft Drink', 'Демо Напиток', 'Demo Soft Drink'),
            imageUrl: null,
            price: 1200,
          },
        ],
      },
      {
        slug: 'alcoholic-drinks',
        title: mk('Alkoholy Chamsher', 'Алкогольные', 'Alcoholic Drinks'),
        items: [
          {
            slug: 'demo-alcoholic-drink',
            name: mk('Demo Alcoholic Drink', 'Демо Алк. Напиток', 'Demo Alcoholic Drink'),
            imageUrl: null,
            price: null,
          },
        ],
      },
    ],
  },
];

export function getDemoMenu(locale: Locale): MenuPayload {
  return {
    sections: DEMO_SECTIONS.map((section) => ({
      slug: section.slug,
      title: section.title[locale],
      categories: section.categories.map((cat) => ({
        slug: cat.slug,
        title: cat.title[locale],
        items: cat.items.map((item) => ({
          slug: item.slug,
          name: item.name[locale],
          imageUrl: item.imageUrl,
          price: item.price,
        })),
      })),
    })),
  };
}
