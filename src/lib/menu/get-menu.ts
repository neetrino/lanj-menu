import type { Locale } from '@/lib/i18n/config';
import type { MenuCategoryPayload } from './types';
import type { MenuItemPayload } from './types';
import type { MenuPayload } from './types';
import { getDemoMenu } from './demo-data';

/**
 * Returns the menu payload for the given locale.
 *
 * Priority:
 * 1. MenuSnapshot row in Neon DB (one query, pre-built JSON)
 * 2. Demo/fallback data (when DATABASE_URL is missing or DB is unreachable)
 */
export async function getMenu(locale: Locale): Promise<MenuPayload> {
  if (!process.env.DATABASE_URL) {
    return normalizeMenuStructure(getDemoMenu(locale));
  }

  try {
    const { prisma } = await import('@/db/client');
    const snapshot = await prisma.menuSnapshot.findUnique({ where: { locale } });
    if (snapshot?.data) {
      return normalizeMenuStructure(snapshot.data as MenuPayload);
    }
    // No snapshot built yet — fallback to demo
    return normalizeMenuStructure(getDemoMenu(locale));
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getMenu] DB unavailable, using demo data:', err);
    }
    return normalizeMenuStructure(getDemoMenu(locale));
  }
}

function normalizeMenuStructure(menuPayload: MenuPayload): MenuPayload {
  const normalizedSections = menuPayload.sections.map((section) => {
    if (section.slug !== 'pool-menu') {
      return section;
    }

    const kitchenCategory = section.categories.find((category) => category.slug === 'kitchen');
    const barMenuCategory = buildPoolBarMenuCategory(section.categories);
    const categories: MenuCategoryPayload[] = barMenuCategory
      ? kitchenCategory
        ? [kitchenCategory, barMenuCategory]
        : [barMenuCategory]
      : kitchenCategory
        ? [kitchenCategory]
        : section.categories;

    return {
      ...section,
      categories,
    };
  });

  const poolSection = normalizedSections.find((section) => section.slug === 'pool-menu');
  const poolBarMenuCategory = poolSection?.categories.find((category) => category.slug === 'bar-menu');
  if (!poolBarMenuCategory) {
    return {
      ...menuPayload,
      sections: normalizedSections,
    };
  }

  return {
    ...menuPayload,
    sections: normalizedSections.map((section) => {
      if (section.slug !== 'restaurant') {
        return section;
      }

      const categories = section.categories.map((category) => {
        if (category.slug === 'kitchen') {
          return {
            ...category,
            items: category.items.map((item) => ({
              ...item,
              categoryTitle: getRestaurantKitchenSubcategoryTitle(item.slug) ?? undefined,
            })),
          };
        }

        if (category.slug !== 'bar-menu') {
          return category;
        }

        return {
          ...poolBarMenuCategory,
          items: poolBarMenuCategory.items.map((item) => ({ ...item })),
        };
      });

      return {
        ...section,
        categories,
      };
    }),
  };
}

function getRestaurantKitchenSubcategoryTitle(itemSlug: string): string | null {
  if (RESTAURANT_KITCHEN_APPETIZER_SLUGS.has(itemSlug)) {
    return 'Նախուտեստներ';
  }
  if (RESTAURANT_KITCHEN_SALAD_SLUGS.has(itemSlug)) {
    return 'Աղցաներ';
  }
  return 'Տաք ուտեստներ';
}

function buildPoolBarMenuCategory(categories: MenuCategoryPayload[]): MenuCategoryPayload | null {
  const barRoot = categories.find((category) => category.slug === 'bar-menu');
  const barMenuLikeCategories = categories.filter(
    (category) => category.slug === 'bar-menu' || category.slug.startsWith('bar-menu-'),
  );
  if (barMenuLikeCategories.length === 0) {
    return null;
  }

  const mergedItems: MenuItemPayload[] = barMenuLikeCategories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryTitle: category.title,
    })),
  );

  return {
    slug: 'bar-menu',
    title: barRoot?.title ?? 'Bar Menu',
    items: mergedItems,
  };
}

const RESTAURANT_KITCHEN_APPETIZER_SLUGS = new Set([
  'appetizer-set',
  'tomato-bruschetta',
  'salmon-bruschetta',
  'olives',
  'european-cheese-board',
  'fried-cheese',
  'stuffed-vegetables',
  'calamari-rings',
  'shrimp-tempura',
  'chicken-nuggets',
  'seafood-platter',
]);

const RESTAURANT_KITCHEN_SALAD_SLUGS = new Set([
  'lanj-salad',
  'greek-salad',
  'caesar-salad',
  'shrimp-caesar',
  'caprese',
  'beef-salad',
  'vegetable-bouquet',
  'thai-beef',
]);
