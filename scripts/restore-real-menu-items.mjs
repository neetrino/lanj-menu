/**
 * Restores real menu items from legacy restaurant/daily-menu into restaurant/kitchen
 * and removes demo items added by seed-menu-structure.mjs.
 *
 * Run: node scripts/restore-real-menu-items.mjs
 */
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const SEED_DEMO_ITEM_SLUGS = [
  'frozen-tropical-cocktail',
  'poolside-mojito',
  'aperol-spritz',
  'cucumber-gin-cooler',
  'grilled-chicken-salad',
  'club-sandwich',
  'house-red-wine',
  'classic-negroni',
  'beef-steak',
  'pasta-carbonara',
];

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

async function main() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    const restaurantKitchen = await prisma.menuCategory.findFirst({
      where: {
        slug: 'kitchen',
        section: { slug: 'restaurant' },
      },
    });

    if (!restaurantKitchen) {
      throw new Error('restaurant/kitchen category not found — run db:seed first');
    }

    const dailyMenu = await prisma.menuCategory.findFirst({
      where: {
        slug: 'daily-menu',
        section: { slug: 'restaurant' },
      },
      include: { items: true },
    });

    let moved = 0;
    if (dailyMenu) {
      const result = await prisma.menuItem.updateMany({
        where: { categoryId: dailyMenu.id },
        data: { categoryId: restaurantKitchen.id, isActive: true },
      });
      moved = result.count;

      await prisma.menuCategory.update({
        where: { id: dailyMenu.id },
        data: { isActive: false },
      });
    }

    const deleted = await prisma.menuItem.deleteMany({
      where: { slug: { in: SEED_DEMO_ITEM_SLUGS } },
    });

    await rebuildMenuSnapshots(prisma);

    const kitchenCount = await prisma.menuItem.count({
      where: { categoryId: restaurantKitchen.id, isActive: true },
    });
    const withPhotos = await prisma.menuItem.count({
      where: { categoryId: restaurantKitchen.id, isActive: true, imageUrl: { not: null } },
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          movedFromDailyMenu: moved,
          deletedDemoItems: deleted.count,
          restaurantKitchen: { total: kitchenCount, withPhotos },
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
