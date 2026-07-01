import path from 'node:path';
import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';
import {
  loadRestaurantKitchenSubcategoryData,
  resolveRestaurantKitchenSubcategoryTitle,
} from './lib/restaurant-kitchen-subcategories.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const CATALOG_PATH = path.resolve(process.cwd(), 'data/restaurant-daily-menu-items.json');

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

async function main() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const rawCatalog = await fs.readFile(CATALOG_PATH, 'utf8');
  const catalog = JSON.parse(rawCatalog);

  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error('Catalog is empty');
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const { subcategories, slugToKey } = await loadRestaurantKitchenSubcategoryData();

    const category = await prisma.menuCategory.findFirst({
      where: {
        slug: 'kitchen',
        section: { slug: 'restaurant' },
      },
      include: {
        items: true,
      },
    });

    if (!category) {
      throw new Error('restaurant/kitchen category not found — run pnpm db:seed first');
    }

    const existingBySlug = new Map(category.items.map((item) => [item.slug, item]));
    const allowedSlugs = new Set(catalog.map((item) => item.slug));

    const deletedSlugs = [];
    for (const item of category.items) {
      if (!allowedSlugs.has(item.slug)) {
        await prisma.menuItem.delete({ where: { id: item.id } });
        deletedSlugs.push(item.slug);
      }
    }

    const upserted = [];
    for (const [index, item] of catalog.entries()) {
      const existing = existingBySlug.get(item.slug);
      const subcategoryTitle = resolveRestaurantKitchenSubcategoryTitle(
        item.slug,
        subcategories,
        slugToKey,
      );
      const data = {
        name: item.name,
        price: item.price,
        sortOrder: index,
        subcategoryTitle,
        isActive: true,
      };

      if (existing) {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            slug: item.slug,
            imageUrl: null,
            ...data,
          },
        });
      }

      upserted.push({ slug: item.slug, price: item.price, hy: item.name?.hy ?? '' });
    }

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          category: 'restaurant/kitchen',
          upserted: upserted.length,
          deleted: deletedSlugs.length,
          deletedSlugs,
          sample: upserted.slice(0, 8),
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
