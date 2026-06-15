import type { Locale } from '@/lib/i18n/config';
import type { MenuPayload } from './types';

type T = Record<Locale, string>;

function mk(hy: string, ru: string, en: string): T {
  return { hy, ru, en };
}

const DEMO_SECTIONS = [
  {
    slug: 'pool-menu',
    title: mk('Լողավազանի մենյու', 'Меню бассейна', 'Pool Menu'),
    categories: [
      {
        slug: 'bar-menu',
        title: mk('Բարի մենյու', 'Бар-меню', 'Bar Menu'),
        items: [
          {
            slug: 'frozen-tropical-cocktail',
            name: mk('Թրոպիկ կոկտեյլ', 'Тропический коктейль', 'Frozen Tropical Cocktail'),
            imageUrl: null,
            price: 12000,
          },
          {
            slug: 'poolside-mojito',
            name: mk('Լողավազանի մոխիտո', 'Бассейн мохито', 'Poolside Mojito'),
            imageUrl: null,
            price: 11000,
          },
          {
            slug: 'aperol-spritz',
            name: mk('Ապերոլ սպրից', 'Апероль шприц', 'Aperol Spritz'),
            imageUrl: null,
            price: 10500,
          },
          {
            slug: 'cucumber-gin-cooler',
            name: mk('Վարունգի ջին կուլեր', 'Огуречный джин-кулер', 'Cucumber Gin Cooler'),
            imageUrl: null,
            price: 11500,
          },
        ],
      },
      {
        slug: 'kitchen',
        title: mk('Խոհանոց', 'Кухня', 'Kitchen'),
        items: [
          {
            slug: 'grilled-chicken-salad',
            name: mk('Խորոված հավի սալաթ', 'Салат с курицей гриль', 'Grilled Chicken Salad'),
            imageUrl: null,
            price: 8500,
          },
          {
            slug: 'club-sandwich',
            name: mk('Կլաբ սենդվիչ', 'Клаб-сэндвич', 'Club Sandwich'),
            imageUrl: null,
            price: 7500,
          },
        ],
      },
    ],
  },
  {
    slug: 'restaurant',
    title: mk('Ռեստորան', 'Ресторан', 'Restaurant'),
    categories: [
      {
        slug: 'kitchen',
        title: mk('Խոհանոց', 'Кухня', 'Kitchen'),
        items: [
          {
            slug: 'beef-steak',
            name: mk('Բիֆշտեքս', 'Бифштекс', 'Beef Steak'),
            imageUrl: null,
            price: 18500,
          },
          {
            slug: 'pasta-carbonara',
            name: mk('Պաստա կարբոնարա', 'Паста карбонара', 'Pasta Carbonara'),
            imageUrl: null,
            price: 12500,
          },
        ],
      },
      {
        slug: 'bar-menu',
        title: mk('Բարի մենյու', 'Бар-меню', 'Bar Menu'),
        items: [
          {
            slug: 'house-red-wine',
            name: mk('Տնային կարմիր գինի', 'Домашнее красное вино', 'House Red Wine'),
            imageUrl: null,
            price: 9000,
          },
          {
            slug: 'classic-negroni',
            name: mk('Կլասիկ նեգրոնի', 'Классический негрони', 'Classic Negroni'),
            imageUrl: null,
            price: 13000,
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
