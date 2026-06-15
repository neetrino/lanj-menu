import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const IMPORTED_CATEGORY_SLUGS = [
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
];

const R2_PLACEHOLDER_KEY = 'menu-items/pool-menu-drinks-placeholder.webp';
const LOCAL_PLACEHOLDER_URL = '/images/placeholders/pool-menu-drinks-placeholder.webp';

function resolveSharedImageUrl() {
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!r2PublicUrl) {
    return LOCAL_PLACEHOLDER_URL;
  }
  return `${r2PublicUrl.replace(/\/$/, '')}/${R2_PLACEHOLDER_KEY}`;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const expectedSharedImageUrl = resolveSharedImageUrl();
    const poolSection = await prisma.menuSection.findUnique({
      where: { slug: 'pool-menu' },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });

    const importedCategories =
      poolSection?.categories.filter((category) => IMPORTED_CATEGORY_SLUGS.includes(category.slug)) ?? [];

    const totalItemsInImportedCategories = importedCategories.reduce(
      (acc, category) => acc + category.items.length,
      0,
    );

    const allImportedImageUrlSame = importedCategories.every((category) =>
      category.items.every((item) => item.imageUrl === expectedSharedImageUrl),
    );

    const legacyBarMenu = poolSection?.categories.find((category) => category.slug === 'bar-menu') ?? null;

    const snapshots = await prisma.menuSnapshot.findMany({
      where: { locale: { in: ['hy', 'ru', 'en'] } },
      select: { locale: true, updatedAt: true },
      orderBy: { locale: 'asc' },
    });

    const enSnapshot = await prisma.menuSnapshot.findUnique({
      where: { locale: 'en' },
      select: { data: true },
    });

    const sections = enSnapshot?.data?.sections ?? [];
    const poolMenuSnapshot = sections.find((section) => section.slug === 'pool-menu') ?? null;
    const softDrinksSnapshotCategory =
      poolMenuSnapshot?.categories?.find((category) => category.slug === 'bar-menu-soft-drinks') ?? null;

    console.log(
      JSON.stringify(
        {
          sectionExists: Boolean(poolSection),
          importedCategories: importedCategories.length,
          totalItemsInImportedCategories,
          expectedSharedImageUrl,
          allImportedImageUrlSame,
          legacyBarMenu: legacyBarMenu
            ? { isActive: legacyBarMenu.isActive, itemCount: legacyBarMenu.items.length }
            : null,
          snapshots,
          poolMenuInSnapshot: Boolean(poolMenuSnapshot),
          softDrinksCategoryInSnapshot: Boolean(softDrinksSnapshotCategory),
          softDrinksFirstItem: softDrinksSnapshotCategory?.items?.[0] ?? null,
          restaurantSectionExists: Boolean(
            await prisma.menuSection.findUnique({ where: { slug: 'restaurant' }, select: { id: true } }),
          ),
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
