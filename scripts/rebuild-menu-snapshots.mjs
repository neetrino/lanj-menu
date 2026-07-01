/**
 * Rebuilds MenuSnapshot rows for all locales from relational menu tables.
 * Shared by seed and import scripts.
 */
import { resolveItemCategoryTitle } from './lib/restaurant-kitchen-subcategories.mjs';

export async function rebuildMenuSnapshots(prisma) {
  const sections = await prisma.menuSection.findMany({
    include: {
      categories: {
        include: { items: true },
      },
    },
  });

  const locales = ['hy', 'ru', 'en'];

  for (const locale of locales) {
    const payload = {
      sections: sections
        .filter((s) => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section) => ({
          slug: section.slug,
          title:
            section.title?.[locale] ??
            section.title?.hy ??
            section.title?.en ??
            Object.values(section.title ?? {})[0] ??
            '',
          categories: section.categories
            .filter((c) => c.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => ({
              slug: category.slug,
              title:
                category.title?.[locale] ??
                category.title?.hy ??
                category.title?.en ??
                Object.values(category.title ?? {})[0] ??
                '',
              items: category.items
                .filter((i) => i.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => {
                  const payloadItem = {
                    slug: item.slug,
                    name:
                      item.name?.[locale] ??
                      item.name?.hy ??
                      item.name?.en ??
                      Object.values(item.name ?? {})[0] ??
                      '',
                    imageUrl: item.imageUrl,
                    price: item.price,
                  };

                  const categoryTitle = resolveItemCategoryTitle(item, locale);
                  if (categoryTitle) {
                    payloadItem.categoryTitle = categoryTitle;
                  }

                  return payloadItem;
                }),
            })),
        })),
    };

    await prisma.menuSnapshot.upsert({
      where: { locale },
      update: { data: payload },
      create: { locale, data: payload },
    });
  }
}
