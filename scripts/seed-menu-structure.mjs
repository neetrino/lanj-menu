/**
 * Seeds menu structure only: sections + categories with i18n titles.
 * Does NOT create demo items or deactivate existing categories.
 *
 * Run: pnpm db:seed
 */
import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const SECTIONS = [
  {
    slug: 'pool-menu',
    sortOrder: 0,
    title: {
      hy: 'Լողավազանի մենյու',
      ru: 'Меню бассейна',
      en: 'Pool Menu',
    },
    categories: [
      {
        slug: 'bar-menu',
        sortOrder: 0,
        title: {
          hy: 'Բարի մենյու',
          ru: 'Бар-меню',
          en: 'Bar Menu',
        },
      },
      {
        slug: 'kitchen',
        sortOrder: 1,
        title: {
          hy: 'Խոհանոց',
          ru: 'Кухня',
          en: 'Kitchen',
        },
      },
    ],
  },
  {
    slug: 'restaurant',
    sortOrder: 1,
    title: {
      hy: 'Ռեստորան',
      ru: 'Ресторан',
      en: 'Restaurant',
    },
    categories: [
      {
        slug: 'bar-menu',
        sortOrder: 0,
        title: {
          hy: 'Բարի մենյու',
          ru: 'Бар-меню',
          en: 'Bar Menu',
        },
      },
      {
        slug: 'kitchen',
        sortOrder: 1,
        title: {
          hy: 'Խոհանոց',
          ru: 'Кухня',
          en: 'Kitchen',
        },
      },
    ],
  },
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
    for (const section of SECTIONS) {
      const sectionRow = await prisma.menuSection.upsert({
        where: { slug: section.slug },
        update: {
          title: section.title,
          sortOrder: section.sortOrder,
          isActive: true,
        },
        create: {
          slug: section.slug,
          title: section.title,
          sortOrder: section.sortOrder,
          isActive: true,
        },
      });

      for (const category of section.categories) {
        await prisma.menuCategory.upsert({
          where: {
            sectionId_slug: { sectionId: sectionRow.id, slug: category.slug },
          },
          update: {
            title: category.title,
            sortOrder: category.sortOrder,
            isActive: true,
          },
          create: {
            sectionId: sectionRow.id,
            slug: category.slug,
            title: category.title,
            sortOrder: category.sortOrder,
            isActive: true,
          },
        });
      }
    }

    await rebuildMenuSnapshots(prisma);

    const summary = await prisma.menuSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          note: 'Structure only — existing items are preserved',
          sections: summary.map((s) => ({
            slug: s.slug,
            title: s.title,
            categories: s.categories.map((c) => ({
              slug: c.slug,
              title: c.title,
              items: c.items.length,
              withPhotos: c.items.filter((i) => i.imageUrl).length,
            })),
          })),
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
