import path from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const R2_PLACEHOLDER_KEY = 'menu-items/pool-menu-drinks-placeholder.webp';
const LOCAL_PLACEHOLDER_URL = '/images/placeholders/pool-menu-drinks-placeholder.webp';

function resolveSharedImageUrl() {
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!r2PublicUrl) {
    return LOCAL_PLACEHOLDER_URL;
  }
  return `${r2PublicUrl.replace(/\/$/, '')}/${R2_PLACEHOLDER_KEY}`;
}

const POOL_SECTION = {
  slug: 'pool-menu',
  title: {
    hy: 'Լողավազանի մենյու',
    ru: 'Меню бассейна',
    en: 'Pool Menu',
  },
  sortOrder: 0,
};

const DEMO_POOL_BAR_ITEM_SLUGS = new Set([
  'frozen-tropical-cocktail',
  'poolside-mojito',
  'aperol-spritz',
  'cucumber-gin-cooler',
]);

const CATEGORY_SPECS = [
  {
    slug: 'bar-menu-soft-drinks',
    sortOrder: 0,
    title: {
      hy: 'Զովացուցիչ ըմպելիքներ',
      ru: 'Безалкогольные напитки',
      en: 'Soft Drinks',
    },
    items: [
      {
        slug: 'redbull',
        sortOrder: 0,
        price: 2000,
        name: { hy: 'Redbull', ru: 'Redbull', en: 'Redbull' },
      },
      {
        slug: 'tonic-water',
        sortOrder: 1,
        price: 1500,
        name: { hy: 'Տոնիկ ջուր', ru: 'Тоник', en: 'Tonic Water' },
      },
      {
        slug: 'natural-juice-glass',
        sortOrder: 2,
        price: 1000,
        name: {
          hy: 'Բնական հյութ՝ բաժակ',
          ru: 'Натуральный сок, бокал',
          en: 'Natural Juice Glass',
        },
      },
      {
        slug: 'pepsi-mirinda-7up',
        sortOrder: 3,
        price: 800,
        name: {
          hy: 'Pepsi / Mirinda / 7UP',
          ru: 'Pepsi / Mirinda / 7UP',
          en: 'Pepsi / Mirinda / 7UP',
        },
      },
      {
        slug: 'water-sparkling-water',
        sortOrder: 4,
        price: 800,
        name: {
          hy: 'Ջուր / Գազավորված ջուր',
          ru: 'Вода / Газированная вода',
          en: 'Water / Sparkling Water',
        },
      },
    ],
  },
  {
    slug: 'bar-menu-fresh-lemonades',
    sortOrder: 1,
    title: {
      hy: 'Ֆրեշներ և լիմոնադներ',
      ru: 'Фреши и лимонады',
      en: 'Fresh & Lemonades',
    },
    items: [
      {
        slug: 'orange-fresh',
        sortOrder: 0,
        price: 2500,
        name: { hy: 'Նարնջի ֆրեշ', ru: 'Апельсиновый фреш', en: 'Orange Fresh' },
      },
      {
        slug: 'grapefruit-fresh',
        sortOrder: 1,
        price: 2500,
        name: { hy: 'Գրեյպֆրուտի ֆրեշ', ru: 'Грейпфрутовый фреш', en: 'Grapefruit Fresh' },
      },
      {
        slug: 'apple-fresh',
        sortOrder: 2,
        price: 2500,
        name: { hy: 'Խնձորի ֆրեշ', ru: 'Яблочный фреш', en: 'Apple Fresh' },
      },
      {
        slug: 'citrus-lemonade-glass',
        sortOrder: 3,
        price: 2500,
        name: {
          hy: 'Ցիտրուսային լիմոնադ՝ բաժակ',
          ru: 'Цитрусовый лимонад, бокал',
          en: 'Citrus Lemonade Glass',
        },
      },
      {
        slug: 'berry-lemonade-glass',
        sortOrder: 4,
        price: 2500,
        name: {
          hy: 'Հատապտղային լիմոնադ՝ բաժակ',
          ru: 'Ягодный лимонад, бокал',
          en: 'Berry Lemonade Glass',
        },
      },
    ],
  },
  {
    slug: 'bar-menu-milkshake',
    sortOrder: 2,
    title: {
      hy: 'Միլքշեյք',
      ru: 'Милкшейк',
      en: 'Milkshake',
    },
    items: [
      {
        slug: 'banana-strawberry',
        sortOrder: 0,
        price: 3500,
        name: {
          hy: 'Բանան-ելակային միլքշեյք',
          ru: 'Милкшейк банан-клубника',
          en: 'Banana Strawberry',
        },
      },
      {
        slug: 'oreo',
        sortOrder: 1,
        price: 3500,
        name: { hy: 'Oreo', ru: 'Oreo', en: 'Oreo' },
      },
    ],
  },
  {
    slug: 'bar-menu-tea-coffee',
    sortOrder: 3,
    title: {
      hy: 'Թեյ և սուրճ',
      ru: 'Чай и кофе',
      en: 'Tea & Coffee',
    },
    items: [
      {
        slug: 'ice-tea-berry',
        sortOrder: 0,
        price: 2500,
        name: {
          hy: 'Սառը թեյ՝ հատապտղային',
          ru: 'Холодный ягодный чай',
          en: 'Ice Tea Berry',
        },
      },
      {
        slug: 'ice-tea-citrus',
        sortOrder: 1,
        price: 2500,
        name: {
          hy: 'Սառը թեյ՝ ցիտրուսային',
          ru: 'Холодный цитрусовый чай',
          en: 'Ice Tea Citrus',
        },
      },
      {
        slug: 'glace',
        sortOrder: 2,
        price: 2500,
        name: { hy: 'Գլասե', ru: 'Глясе', en: 'Glace' },
      },
      {
        slug: 'cappuccino-latte-flat-white',
        sortOrder: 3,
        price: 2000,
        name: {
          hy: 'Կապուչինո / Լատտե / Ֆլեթ Ուայթ',
          ru: 'Капучино / Латте / Флэт Уайт',
          en: 'Cappuccino / Latte / Flat White',
        },
      },
      {
        slug: 'espresso-americano',
        sortOrder: 4,
        price: 1700,
        name: {
          hy: 'Էսպրեսո / Ամերիկանո',
          ru: 'Эспрессо / Американо',
          en: 'Espresso / Americano',
        },
      },
      {
        slug: 'oriental-coffee',
        sortOrder: 5,
        price: 1000,
        name: { hy: 'Արևելյան սուրճ', ru: 'Кофе по-восточному', en: 'Oriental Coffee' },
      },
    ],
  },
  {
    slug: 'bar-menu-beer',
    sortOrder: 4,
    title: {
      hy: 'Գարեջուր',
      ru: 'Пиво',
      en: 'Beer',
    },
    items: [
      {
        slug: 'paulaner-draft-03l',
        sortOrder: 0,
        price: 2200,
        name: { hy: 'Paulaner Draft 0.3L', ru: 'Paulaner Draft 0.3L', en: 'Paulaner Draft 0.3L' },
      },
      {
        slug: 'paulaner-draft-05l',
        sortOrder: 1,
        price: 2800,
        name: { hy: 'Paulaner Draft 0.5L', ru: 'Paulaner Draft 0.5L', en: 'Paulaner Draft 0.5L' },
      },
      {
        slug: 'corona-extra-03l',
        sortOrder: 2,
        price: 2200,
        name: { hy: 'Corona Extra 0.3L', ru: 'Corona Extra 0.3L', en: 'Corona Extra 0.3L' },
      },
      {
        slug: 'heineken-03l',
        sortOrder: 3,
        price: 2200,
        name: { hy: 'Heineken 0.3L', ru: 'Heineken 0.3L', en: 'Heineken 0.3L' },
      },
    ],
  },
  {
    slug: 'bar-menu-cocktails',
    sortOrder: 5,
    title: {
      hy: 'Կոկտեյլներ',
      ru: 'Коктейли',
      en: 'Cocktails',
    },
    items: [
      'Aperol Spritz',
      'Apple Spritz',
      'Limoncello Spritz',
      'Long Island Ice Tea',
      'Adios',
      'Tokyo Tea',
      'Mai Tai',
      'Tequila Sunrise',
      'Mojito',
      'Cranberry Pineapple Fizz',
      'Moscow Mule',
      'Sex On The Beach',
      'Pina Colada',
      'Gin & Tonik',
      'Cuba Libre',
    ].map((name, index) => ({
      slug:
        [
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
        ][index],
      sortOrder: index,
      price: index <= 6 ? 4500 : index <= 8 ? 4000 : 3500,
      name: { hy: name, ru: name, en: name },
    })),
  },
  {
    slug: 'bar-menu-whisky-scotch',
    sortOrder: 6,
    title: {
      hy: 'Վիսկի — Շոտլանդական',
      ru: 'Виски — Шотландский',
      en: 'Whisky — Scotch',
    },
    items: [
      ['macallan-lumina', 'Macallan Lumina', 20000],
      ['macallan-quest', 'Macallan Quest', 10000],
      ['chivas-regal-18', 'Chivas Regal 18', 10000],
      ['glenfiddich-15', 'Glenfiddich 15', 8000],
      ['glenfiddich-12', 'Glenfiddich 12', 5500],
      ['glenfiddich-fair-cane', 'Glenfiddich Fair & Cane', 5500],
      ['chivas-regal-12', 'Chivas Regal 12', 5000],
      ['auchentoshan-12-yo', 'Auchentoshan 12 Y.O.', 5000],
      ['monkey-shoulder', 'Monkey Shoulder', 4500],
      ['aerstone-10-yo', 'Aerstone 10 Y.O.', 4000],
    ].map(([slug, name, price], index) => ({
      slug,
      sortOrder: index,
      price,
      name: { hy: name, ru: name, en: name },
    })),
  },
  {
    slug: 'bar-menu-whisky-american-bourbon',
    sortOrder: 7,
    title: {
      hy: 'Վիսկի — Ամերիկյան / Բուրբոն',
      ru: 'Виски — Американский / Бурбон',
      en: 'Whisky — American / Bourbon',
    },
    items: [
      ['woodford-reserve', 'Woodford Reserve', 5000],
      ['jack-daniels-no-7', 'Jack Daniels No. 7', 4000],
      ['jack-daniels-honey', 'Jack Daniels Honey', 3500],
      ['jack-daniels-apple', 'Jack Daniels Apple', 3500],
      ['evan-williams', 'Evan Williams', 2500],
    ].map(([slug, name, price], index) => ({
      slug,
      sortOrder: index,
      price,
      name: { hy: name, ru: name, en: name },
    })),
  },
  {
    slug: 'bar-menu-whisky-irish-japanese',
    sortOrder: 8,
    title: {
      hy: 'Վիսկի — Իռլանդական / Ճապոնական',
      ru: 'Виски — Ирландский / Японский',
      en: 'Whisky — Irish / Japanese',
    },
    items: [
      ['nikka-from-the-barrel', 'Nikka From The Barrel', 7000],
      ['akashi-red', 'Akashi Red', 5000],
      ['jameson', 'Jameson', 3500],
      ['tullamore-dew', 'Tullamore D.E.W.', 3500],
    ].map(([slug, name, price], index) => ({
      slug,
      sortOrder: index,
      price,
      name: { hy: name, ru: name, en: name },
    })),
  },
  {
    slug: 'bar-menu-rum',
    sortOrder: 9,
    title: {
      hy: 'Ռոմ',
      ru: 'Ром',
      en: 'Rum',
    },
    items: [
      ['diplomatico', 'Diplomatico', 5500],
      ['bacardi-8-yo-reserva', 'Bacardi 8 Y.O Reserva', 5000],
      ['don-papa', 'Don Papa', 5000],
      ['matusalem-7-yo', 'Matusalem 7 Y.O', 4000],
      ['havana-club-7-yo', 'Havana Club 7 Y.O', 4000],
      ['havana-club-selection', 'Havana Club Selection', 4000],
      ['bacardi-carta-blanca', 'Bacardi Carta Blanca', 3500],
      ['bacardi-carta-nergra', 'Bacardi Carta Nergra', 3500],
      ['clement-premiere-canna', 'Clement Premiere Canna', 3000],
      ['santiago-carta-blanca', 'Santiago Carta Blanca', 3000],
    ].map(([slug, name, price], index) => ({
      slug,
      sortOrder: index,
      price,
      name: { hy: name, ru: name, en: name },
    })),
  },
  {
    slug: 'bar-menu-gin',
    sortOrder: 10,
    title: {
      hy: 'Ջին',
      ru: 'Джин',
      en: 'Gin',
    },
    items: [
      ['monkey-47', 'Monkey 47', 6500],
      ['knut-hansen', 'Knut Hansen', 5000],
      ['hendricks', 'Hendricks', 5000],
      ['stin-sloe', 'Stin Sloe', 5000],
      ['the-botanist-22', 'The Botanist 22', 4000],
      ['j-rose', 'J Rose', 4000],
      ['mermaid-zest-pink', 'Mermaid Zest / Pink', 3500],
      ['bombay-sapphire', 'Bombay Sapphire', 3500],
      ['vogis-classic-wild-cherry-peach', 'Vogis Classic / Wild Cherry / Peach', 3500],
      ['beefeater', 'Beefeater', 3000],
      ['sourse', 'Sourse', 3000],
    ].map(([slug, name, price], index) => ({
      slug,
      sortOrder: index,
      price,
      name: { hy: name, ru: name, en: name },
    })),
  },
];

const ALLOWED_CATEGORY_SLUGS = new Set(CATEGORY_SPECS.map((category) => category.slug));

const ALLOWED_ITEM_SLUGS_BY_CATEGORY = new Map(
  CATEGORY_SPECS.map((category) => [
    category.slug,
    new Set(category.items.map((item) => item.slug)),
  ]),
);

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

async function ensurePoolSection(prisma) {
  return prisma.menuSection.upsert({
    where: { slug: POOL_SECTION.slug },
    update: {
      title: POOL_SECTION.title,
      sortOrder: POOL_SECTION.sortOrder,
      isActive: true,
    },
    create: {
      slug: POOL_SECTION.slug,
      title: POOL_SECTION.title,
      sortOrder: POOL_SECTION.sortOrder,
      isActive: true,
    },
  });
}

async function maybeDeactivateLegacyBarMenu(prisma, poolSectionId) {
  const legacyBarMenu = await prisma.menuCategory.findUnique({
    where: {
      sectionId_slug: {
        sectionId: poolSectionId,
        slug: 'bar-menu',
      },
    },
    include: {
      items: true,
    },
  });

  if (!legacyBarMenu) {
    return { found: false, action: 'not-found' };
  }

  const hasItems = legacyBarMenu.items.length > 0;
  const hasOnlyDemoOrNoItems =
    !hasItems || legacyBarMenu.items.every((item) => DEMO_POOL_BAR_ITEM_SLUGS.has(item.slug));

  if (!hasOnlyDemoOrNoItems) {
    return {
      found: true,
      action: 'kept-active-has-real-items',
      itemCount: legacyBarMenu.items.length,
    };
  }

  await prisma.menuCategory.update({
    where: { id: legacyBarMenu.id },
    data: { isActive: false },
  });

  return {
    found: true,
    action: 'set-inactive-demo-only-or-empty',
    itemCount: legacyBarMenu.items.length,
  };
}

async function deactivateExtraPoolMenuData(prisma, poolSectionId) {
  const categories = await prisma.menuCategory.findMany({
    where: { sectionId: poolSectionId },
    include: { items: true },
  });

  const deactivatedCategories = [];
  const deactivatedItems = [];

  for (const category of categories) {
    const isAllowedCategory = ALLOWED_CATEGORY_SLUGS.has(category.slug);
    if (!isAllowedCategory) {
      if (category.isActive) {
        await prisma.menuCategory.update({
          where: { id: category.id },
          data: { isActive: false },
        });
        deactivatedCategories.push({
          slug: category.slug,
          reason: 'category-not-in-allowed-list',
        });
      }

      for (const item of category.items) {
        if (item.isActive) {
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { isActive: false },
          });
          deactivatedItems.push({
            categorySlug: category.slug,
            itemSlug: item.slug,
            reason: 'item-under-non-allowed-category',
          });
        }
      }
      continue;
    }

    const allowedItems = ALLOWED_ITEM_SLUGS_BY_CATEGORY.get(category.slug) ?? new Set();
    for (const item of category.items) {
      if (!allowedItems.has(item.slug) && item.isActive) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { isActive: false },
        });
        deactivatedItems.push({
          categorySlug: category.slug,
          itemSlug: item.slug,
          reason: 'item-not-in-allowed-list',
        });
      }
    }
  }

  return {
    deactivatedCategories,
    deactivatedItems,
  };
}

async function upsertCategoriesAndItems(prisma, poolSectionId, sharedImageUrl) {
  const summary = [];
  let itemsProcessed = 0;
  let categoriesCreated = 0;
  let categoriesUpdated = 0;
  let itemsCreated = 0;
  let itemsUpdated = 0;

  for (const categorySpec of CATEGORY_SPECS) {
    const existingCategory = await prisma.menuCategory.findUnique({
      where: {
        sectionId_slug: {
          sectionId: poolSectionId,
          slug: categorySpec.slug,
        },
      },
      select: { id: true },
    });

    const category = await prisma.menuCategory.upsert({
      where: {
        sectionId_slug: {
          sectionId: poolSectionId,
          slug: categorySpec.slug,
        },
      },
      update: {
        title: categorySpec.title,
        sortOrder: categorySpec.sortOrder,
        isActive: true,
      },
      create: {
        sectionId: poolSectionId,
        slug: categorySpec.slug,
        title: categorySpec.title,
        sortOrder: categorySpec.sortOrder,
        isActive: true,
      },
    });

    if (existingCategory) {
      categoriesUpdated += 1;
    } else {
      categoriesCreated += 1;
    }

    for (const itemSpec of categorySpec.items) {
      const existingItem = await prisma.menuItem.findUnique({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: itemSpec.slug,
          },
        },
        select: { id: true },
      });

      await prisma.menuItem.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: itemSpec.slug,
          },
        },
        update: {
          name: itemSpec.name,
          imageUrl: sharedImageUrl,
          price: itemSpec.price,
          sortOrder: itemSpec.sortOrder,
          isActive: true,
        },
        create: {
          categoryId: category.id,
          slug: itemSpec.slug,
          name: itemSpec.name,
          imageUrl: sharedImageUrl,
          price: itemSpec.price,
          sortOrder: itemSpec.sortOrder,
          isActive: true,
        },
      });

      if (existingItem) {
        itemsUpdated += 1;
      } else {
        itemsCreated += 1;
      }

      itemsProcessed += 1;
    }

    summary.push({
      slug: category.slug,
      title: categorySpec.title,
      items: categorySpec.items.length,
    });
  }

  return {
    categories: summary,
    itemsProcessed,
    categoriesCreated,
    categoriesUpdated,
    itemsCreated,
    itemsUpdated,
  };
}

async function main() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    const sharedImageUrl = resolveSharedImageUrl();
    const poolSection = await ensurePoolSection(prisma);
    const legacyBarMenuAction = await maybeDeactivateLegacyBarMenu(prisma, poolSection.id);
    const upsertSummary = await upsertCategoriesAndItems(prisma, poolSection.id, sharedImageUrl);
    const cleanupSummary = await deactivateExtraPoolMenuData(prisma, poolSection.id);

    await rebuildMenuSnapshots(prisma);

    const snapshotLocales = await prisma.menuSnapshot.findMany({
      where: { locale: { in: ['hy', 'ru', 'en'] } },
      select: { locale: true, updatedAt: true },
      orderBy: { locale: 'asc' },
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          section: poolSection.slug,
          sharedImageUrl,
          legacyBarMenu: legacyBarMenuAction,
          categoriesUpserted: upsertSummary.categories,
          categoryUpsertStats: {
            created: upsertSummary.categoriesCreated,
            updated: upsertSummary.categoriesUpdated,
          },
          totalItemsProcessed: upsertSummary.itemsProcessed,
          itemUpsertStats: {
            created: upsertSummary.itemsCreated,
            updated: upsertSummary.itemsUpdated,
          },
          cleanup: {
            deactivatedCategoriesCount: cleanupSummary.deactivatedCategories.length,
            deactivatedItemsCount: cleanupSummary.deactivatedItems.length,
            deactivatedCategories: cleanupSummary.deactivatedCategories,
            deactivatedItems: cleanupSummary.deactivatedItems,
          },
          snapshotsRebuilt: snapshotLocales,
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
