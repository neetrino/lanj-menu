import type { Locale } from '@/lib/i18n/config';
import type { MenuTabSlugs } from './menu-ui-state';
import type { MenuSectionPayload } from './types';

export type MenuRouteSlugParams = {
  sectionSlug: string;
  categorySlug: string;
};

/** Builds a shareable menu URL for a section + category tab pair. */
export function buildMenuPath(
  locale: Locale,
  sectionSlug: string,
  categorySlug: string,
): string {
  return `/${locale}/${sectionSlug}/${categorySlug}`;
}

export function isValidMenuRoute(
  sections: MenuSectionPayload[],
  sectionSlug: string,
  categorySlug: string,
): boolean {
  const section = sections.find((item) => item.slug === sectionSlug);
  if (!section) return false;
  return section.categories.some((category) => category.slug === categorySlug);
}

/** Returns tab slugs when the URL segments match the menu structure. */
export function resolveMenuTabsFromRoute(
  sections: MenuSectionPayload[],
  sectionSlug: string,
  categorySlug: string,
): MenuTabSlugs | null {
  if (!isValidMenuRoute(sections, sectionSlug, categorySlug)) {
    return null;
  }

  return { sectionSlug, categorySlug };
}

export function listMenuRouteSlugParams(
  sections: MenuSectionPayload[],
): MenuRouteSlugParams[] {
  return sections.flatMap((section) =>
    section.categories.map((category) => ({
      sectionSlug: section.slug,
      categorySlug: category.slug,
    })),
  );
}
