import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

const envPath = path.resolve(process.cwd(), '.env');
const envResult = dotenv.config({ path: envPath, override: true });
const parsedEnv = envResult.parsed ?? {};

function getRequiredEnv(key) {
  const processValue = process.env[key];
  const value =
    processValue && processValue.trim().length > 0
      ? processValue
      : typeof parsedEnv[key] === 'string' && parsedEnv[key].trim().length > 0
        ? parsedEnv[key]
        : undefined;
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function slugify(value) {
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extFrom(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'jpg';
  if (ext === '.png') return 'png';
  if (ext === '.webp') return 'webp';
  return 'bin';
}

function contentTypeFromExt(ext) {
  if (ext === 'jpg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'application/octet-stream';
}

async function rebuildSnapshots(prisma) {
  const sections = await prisma.menuSection.findMany({
    include: {
      categories: {
        include: { items: true },
      },
    },
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
  const imagePath = process.argv[2];
  const hyName = process.argv[3];
  const priceArg = process.argv[4];

  if (!imagePath || !hyName || !priceArg) {
    throw new Error(
      'Usage: node scripts/import-menu-item.mjs "<imagePath>" "<hyName>" "<priceInt>"',
    );
  }

  const price = Number(priceArg);
  if (!Number.isInteger(price) || price < 0) {
    throw new Error('priceInt must be a non-negative integer');
  }

  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');

  const publicBase =
    process.env.R2_PUBLIC_URL ||
    `https://${bucket}.${accountId}.r2.cloudflarestorage.com`;

  const imageBuffer = await fs.readFile(imagePath);
  const ext = extFrom(imagePath);
  const contentType = contentTypeFromExt(ext);

  const itemSlugBase = slugify(hyName) || `item-${Date.now()}`;
  const unique = crypto.randomBytes(4).toString('hex');
  const objectKey = `menu-items/${itemSlugBase}-${Date.now()}-${unique}.${ext}`;

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: imageBuffer,
      ContentType: contentType,
    }),
  );

  const imageUrl = `${publicBase.replace(/\/$/, '')}/${objectKey}`;

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const section = await prisma.menuSection.upsert({
      where: { slug: 'restaurant' },
      update: { isActive: true },
      create: {
        slug: 'restaurant',
        title: { hy: 'Ռեստորան', ru: 'Ресторан', en: 'Restaurant' },
        sortOrder: 1,
        isActive: true,
      },
    });

    const category = await prisma.menuCategory.upsert({
      where: {
        sectionId_slug: { sectionId: section.id, slug: 'daily-menu' },
      },
      update: { isActive: true },
      create: {
        sectionId: section.id,
        slug: 'daily-menu',
        title: { hy: 'Օրվա մենյու', ru: 'Дневное меню', en: 'Daily Menu' },
        sortOrder: 1,
        isActive: true,
      },
    });

    const maxSort = await prisma.menuItem.aggregate({
      where: { categoryId: category.id },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

    const baseSlug = itemSlugBase || `item-${Date.now()}`;
    const existing = await prisma.menuItem.count({
      where: { categoryId: category.id, slug: { startsWith: baseSlug } },
    });
    const finalSlug = existing === 0 ? baseSlug : `${baseSlug}-${existing + 1}`;

    const item = await prisma.menuItem.create({
      data: {
        categoryId: category.id,
        slug: finalSlug,
        name: { hy: hyName, ru: hyName, en: hyName },
        imageUrl,
        price,
        sortOrder: nextSort,
        isActive: true,
      },
    });

    await rebuildSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          itemId: item.id,
          slug: item.slug,
          category: 'restaurant/daily-menu',
          price,
          imageUrl,
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
