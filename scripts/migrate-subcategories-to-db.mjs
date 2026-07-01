import dotenv from 'dotenv';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';
import {
  loadRestaurantKitchenSubcategoryData,
  resolveRestaurantKitchenSubcategoryTitle,
} from './lib/restaurant-kitchen-subcategories.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

async function main() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const { subcategories, slugToKey } = await loadRestaurantKitchenSubcategoryData();

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const category = await prisma.menuCategory.findFirst({
      where: {
        slug: 'kitchen',
        section: { slug: 'restaurant' },
      },
      include: { items: { where: { isActive: true } } },
    });

    if (!category) {
      throw new Error('restaurant/kitchen category not found');
    }

    const updated = [];
    for (const item of category.items) {
      const subcategoryTitle = resolveRestaurantKitchenSubcategoryTitle(
        item.slug,
        subcategories,
        slugToKey,
      );

      await prisma.menuItem.update({
        where: { id: item.id },
        data: { subcategoryTitle },
      });

      updated.push({
        slug: item.slug,
        subcategoryTitle,
      });
    }

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          category: 'restaurant/kitchen',
          updated: updated.length,
          sample: updated.slice(0, 5),
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
