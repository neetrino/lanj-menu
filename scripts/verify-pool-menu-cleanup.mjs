import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const ALLOWED_CATEGORY_SLUGS = new Set([
  'bar-menu-soft-drinks',
  'bar-menu-fresh-lemonades',
  'bar-menu-milkshake',
  'bar-menu-tea-coffee',
  'bar-menu-beer',
  'bar-menu-cocktails',
  'bar-menu-whisky-scotch',
  'bar-menu-whisky-american-bourbon',
  'bar-menu-whisky-irish-japanese',
  'bar-menu-rum',
  'bar-menu-gin',
]);

const ALLOWED_ITEMS_BY_CATEGORY = new Map([
  [
    'bar-menu-soft-drinks',
    new Set([
      'redbull',
      'tonic-water',
      'natural-juice-glass',
      'pepsi-mirinda-7up',
      'water-sparkling-water',
    ]),
  ],
  [
    'bar-menu-fresh-lemonades',
    new Set([
      'orange-fresh',
      'grapefruit-fresh',
      'apple-fresh',
      'citrus-lemonade-glass',
      'berry-lemonade-glass',
    ]),
  ],
  ['bar-menu-milkshake', new Set(['banana-strawberry', 'oreo'])],
  [
    'bar-menu-tea-coffee',
    new Set([
      'ice-tea-berry',
      'ice-tea-citrus',
      'glace',
      'cappuccino-latte-flat-white',
      'espresso-americano',
      'oriental-coffee',
    ]),
  ],
  ['bar-menu-beer', new Set(['paulaner-draft-03l', 'paulaner-draft-05l', 'corona-extra-03l', 'heineken-03l'])],
  [
    'bar-menu-cocktails',
    new Set([
      'aperol-spritz',
      'apple-spritz',
      'limoncello-spritz',
      'long-island-ice-tea',
      'adios',
      'tokyo-tea',
      'mai-tai',
      'tequila-sunrise',
      'mojito',
      'cranberry-pineapple-fizz',
      'moscow-mule',
      'sex-on-the-beach',
      'pina-colada',
      'gin-tonik',
      'cuba-libre',
    ]),
  ],
  [
    'bar-menu-whisky-scotch',
    new Set([
      'macallan-lumina',
      'macallan-quest',
      'chivas-regal-18',
      'glenfiddich-15',
      'glenfiddich-12',
      'glenfiddich-fair-cane',
      'chivas-regal-12',
      'auchentoshan-12-yo',
      'monkey-shoulder',
      'aerstone-10-yo',
    ]),
  ],
  [
    'bar-menu-whisky-american-bourbon',
    new Set([
      'woodford-reserve',
      'jack-daniels-no-7',
      'jack-daniels-honey',
      'jack-daniels-apple',
      'evan-williams',
    ]),
  ],
  [
    'bar-menu-whisky-irish-japanese',
    new Set(['nikka-from-the-barrel', 'akashi-red', 'jameson', 'tullamore-dew']),
  ],
  [
    'bar-menu-rum',
    new Set([
      'diplomatico',
      'bacardi-8-yo-reserva',
      'don-papa',
      'matusalem-7-yo',
      'havana-club-7-yo',
      'havana-club-selection',
      'bacardi-carta-blanca',
      'bacardi-carta-nergra',
      'clement-premiere-canna',
      'santiago-carta-blanca',
    ]),
  ],
  [
    'bar-menu-gin',
    new Set([
      'monkey-47',
      'knut-hansen',
      'hendricks',
      'stin-sloe',
      'the-botanist-22',
      'j-rose',
      'mermaid-zest-pink',
      'bombay-sapphire',
      'vogis-classic-wild-cherry-peach',
      'beefeater',
      'sourse',
    ]),
  ],
]);

async function main() {
  const prisma = new PrismaClient();
  try {
    const pool = await prisma.menuSection.findUnique({
      where: { slug: 'pool-menu' },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });

    const restaurant = await prisma.menuSection.findUnique({
      where: { slug: 'restaurant' },
      select: { id: true },
    });

    if (!pool) {
      throw new Error('pool-menu section not found');
    }

    const activeCategories = pool.categories.filter((category) => category.isActive);
    const extraActiveCategories = activeCategories
      .filter((category) => !ALLOWED_CATEGORY_SLUGS.has(category.slug))
      .map((category) => category.slug);

    const extraActiveItems = [];
    for (const category of pool.categories) {
      const allowedItemSet = ALLOWED_ITEMS_BY_CATEGORY.get(category.slug) ?? new Set();
      for (const item of category.items) {
        if (!item.isActive) continue;
        if (!ALLOWED_CATEGORY_SLUGS.has(category.slug) || !allowedItemSet.has(item.slug)) {
          extraActiveItems.push({ categorySlug: category.slug, itemSlug: item.slug });
        }
      }
    }

    const snapshots = await prisma.menuSnapshot.findMany({
      where: { locale: { in: ['hy', 'ru', 'en'] } },
      select: { locale: true, updatedAt: true },
      orderBy: { locale: 'asc' },
    });

    const activeItemsInAllowedCategories = activeCategories.reduce((acc, category) => {
      return (
        acc +
        category.items.filter(
          (item) => item.isActive && (ALLOWED_ITEMS_BY_CATEGORY.get(category.slug)?.has(item.slug) ?? false),
        ).length
      );
    }, 0);

    console.log(
      JSON.stringify(
        {
          poolMenuExists: true,
          allowedActiveCategories: activeCategories.map((category) => category.slug),
          extraActiveCategories,
          extraActiveItems,
          activeItemsInAllowedCategories,
          restaurantSectionExists: Boolean(restaurant),
          snapshots,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
