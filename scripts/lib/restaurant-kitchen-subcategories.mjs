import fs from 'node:fs/promises';
import path from 'node:path';

const SUBCATEGORIES_PATH = path.resolve(process.cwd(), 'data/restaurant-kitchen-subcategories.json');
const SUBCATEGORY_SLUGS_PATH = path.resolve(
  process.cwd(),
  'data/restaurant-kitchen-subcategory-slugs.json',
);

const DEFAULT_SUBCATEGORY_KEY = 'hot-dishes';

let cachedSubcategoryData = null;

export async function loadRestaurantKitchenSubcategoryData() {
  if (cachedSubcategoryData) {
    return cachedSubcategoryData;
  }

  const [subcategoriesRaw, slugGroupsRaw] = await Promise.all([
    fs.readFile(SUBCATEGORIES_PATH, 'utf8'),
    fs.readFile(SUBCATEGORY_SLUGS_PATH, 'utf8'),
  ]);

  const subcategories = JSON.parse(subcategoriesRaw);
  const slugGroups = JSON.parse(slugGroupsRaw);
  const slugToKey = new Map();

  for (const [key, slugs] of Object.entries(slugGroups)) {
    for (const slug of slugs) {
      slugToKey.set(slug, key);
    }
  }

  cachedSubcategoryData = { subcategories, slugGroups, slugToKey };
  return cachedSubcategoryData;
}

export function resolveRestaurantKitchenSubcategoryKey(slug, slugToKey) {
  return slugToKey.get(slug) ?? DEFAULT_SUBCATEGORY_KEY;
}

export function resolveRestaurantKitchenSubcategoryTitle(slug, subcategories, slugToKey) {
  const key = resolveRestaurantKitchenSubcategoryKey(slug, slugToKey);
  return subcategories[key] ?? subcategories[DEFAULT_SUBCATEGORY_KEY] ?? null;
}

export function resolveLocalizedJson(value, locale) {
  if (!value || typeof value !== 'object') {
    return '';
  }

  return (
    value[locale] ??
    value.hy ??
    value.en ??
    value.ru ??
    Object.values(value).find((entry) => typeof entry === 'string') ??
    ''
  );
}

export function resolveItemCategoryTitle(item, locale) {
  if (!item.subcategoryTitle) {
    return undefined;
  }

  const title = resolveLocalizedJson(item.subcategoryTitle, locale);
  return title || undefined;
}
