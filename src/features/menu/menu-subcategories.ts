import type { MenuItemPayload } from '@/lib/menu/types';

export function listSubcategoryTitles(items: MenuItemPayload[]): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];

  for (const item of items) {
    const title = item.categoryTitle?.trim();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    titles.push(title);
  }

  return titles;
}

export function filterItemsBySubcategory(
  items: MenuItemPayload[],
  subcategoryTitle: string | null,
): MenuItemPayload[] {
  if (!subcategoryTitle) return items;
  return items.filter((item) => item.categoryTitle === subcategoryTitle);
}
