import type { Locale } from '@/lib/i18n/config';
import type { MenuPayload, MenuSectionPayload, MenuCategoryPayload, MenuItemPayload } from './types';

/**
 * Resolves a localised JSON field (e.g. { hy: '...', ru: '...', en: '...' })
 * to a plain string for the requested locale, with graceful fallback.
 */
function resolveLocale(json: unknown, locale: Locale): string {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return '';
  const obj = json as Record<string, unknown>;
  const value =
    obj[locale] ?? obj['hy'] ?? obj['en'] ?? Object.values(obj).find((v) => typeof v === 'string');
  return typeof value === 'string' ? value : '';
}

type RawItem = {
  slug: string;
  name: unknown;
  imageUrl: string | null;
  price: number | null;
  isActive: boolean;
  sortOrder: number;
};

type RawCategory = {
  slug: string;
  title: unknown;
  isActive: boolean;
  sortOrder: number;
  items: RawItem[];
};

type RawSection = {
  slug: string;
  title: unknown;
  isActive: boolean;
  sortOrder: number;
  categories: RawCategory[];
};

/**
 * Converts raw Prisma data (with Json multilingual fields) into a flat,
 * locale-resolved MenuPayload suitable for storing in MenuSnapshot.data.
 *
 * Call this from a seed / snapshot-rebuild script — never on the hot path.
 */
export function buildMenuSnapshot(sections: RawSection[], locale: Locale): MenuPayload {
  const resolved: MenuSectionPayload[] = sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((section) => ({
      slug: section.slug,
      title: resolveLocale(section.title, locale),
      categories: section.categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(
          (cat): MenuCategoryPayload => ({
            slug: cat.slug,
            title: resolveLocale(cat.title, locale),
            items: cat.items
              .filter((i) => i.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(
                (item): MenuItemPayload => ({
                  slug: item.slug,
                  name: resolveLocale(item.name, locale),
                  imageUrl: item.imageUrl,
                  price: item.price,
                }),
              ),
          }),
        ),
    }));

  return { sections: resolved };
}
