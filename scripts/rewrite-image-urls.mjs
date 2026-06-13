import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

function extractKey(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, '');
  } catch {
    return null;
  }
}

async function rebuildSnapshots(prisma) {
  const sections = await prisma.menuSection.findMany({
    include: { categories: { include: { items: true } } },
  });
  const locales = ['hy', 'ru', 'en'];

  for (const locale of locales) {
    const payload = {
      sections: sections
        .filter((s) => s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section) => ({
          slug: section.slug,
          title:
            section.title?.[locale] ??
            section.title?.hy ??
            section.title?.en ??
            Object.values(section.title ?? {})[0] ??
            '',
          categories: section.categories
            .filter((c) => c.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => ({
              slug: category.slug,
              title:
                category.title?.[locale] ??
                category.title?.hy ??
                category.title?.en ??
                Object.values(category.title ?? {})[0] ??
                '',
              items: category.items
                .filter((i) => i.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => ({
                  slug: item.slug,
                  name:
                    item.name?.[locale] ??
                    item.name?.hy ??
                    item.name?.en ??
                    Object.values(item.name ?? {})[0] ??
                    '',
                  imageUrl: item.imageUrl,
                  price: item.price,
                })),
            })),
        })),
    };

    await prisma.menuSnapshot.upsert({
      where: { locale },
      update: { data: payload },
      create: { locale, data: payload },
    });
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const items = await prisma.menuItem.findMany({
      where: { imageUrl: { not: null } },
      select: { id: true, imageUrl: true },
    });

    let updated = 0;
    for (const item of items) {
      if (!item.imageUrl) continue;
      if (item.imageUrl.startsWith('/api/r2/image?key=')) continue;
      const key = extractKey(item.imageUrl);
      if (!key) continue;
      const proxyUrl = `/api/r2/image?key=${encodeURIComponent(key)}`;
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: proxyUrl },
      });
      updated += 1;
    }

    await rebuildSnapshots(prisma);
    console.log(JSON.stringify({ ok: true, updated }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
