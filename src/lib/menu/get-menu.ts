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
    return normalizePoolMenuStructure(getDemoMenu(locale));
  }

  try {
    const { prisma } = await import('@/db/client');
    const snapshot = await prisma.menuSnapshot.findUnique({ where: { locale } });
    if (snapshot?.data) {
      return normalizePoolMenuStructure(snapshot.data as MenuPayload);
    }
    // No snapshot built yet — fallback to demo
    return normalizePoolMenuStructure(getDemoMenu(locale));
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getMenu] DB unavailable, using demo data:', err);
    }
    return normalizePoolMenuStructure(getDemoMenu(locale));
  }
}

function normalizePoolMenuStructure(menuPayload: MenuPayload): MenuPayload {
  return {
    ...menuPayload,
    sections: menuPayload.sections.map((section) => {
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
    }),
  };
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
