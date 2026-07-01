import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

async function main() {
  const imagePath = process.argv[2];
  const itemSlug = process.argv[3];
  const sectionSlug = process.argv[4] ?? 'restaurant';
  const categorySlug = process.argv[5] ?? 'kitchen';
  const priceArg = process.argv[6];
  const hyName = process.argv[7];
  const ruName = process.argv[8] ?? hyName;
  const enName = process.argv[9] ?? hyName;

  if (!imagePath || !itemSlug || !priceArg || !hyName) {
    throw new Error(
      'Usage: node scripts/upsert-menu-item-image.mjs "<imagePath>" "<itemSlug>" [sectionSlug] [categorySlug] <price> "<hyName>" ["<ruName>"] ["<enName>"]',
    );
  }

  const price = Number(priceArg);
  if (!Number.isInteger(price) || price < 0) {
    throw new Error('price must be a non-negative integer');
  }

  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');

  const imageBuffer = await fs.readFile(imagePath);
  const ext = extFrom(imagePath);
  const contentType = contentTypeFromExt(ext);
  const unique = crypto.randomBytes(4).toString('hex');
  const objectKey = `menu-items/${itemSlug}-${Date.now()}-${unique}.${ext}`;
  const proxyUrl = `/api/r2/image?key=${encodeURIComponent(objectKey)}`;

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

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const subcategoryData =
      sectionSlug === 'restaurant' && categorySlug === 'kitchen'
        ? await loadRestaurantKitchenSubcategoryData()
        : null;

    const category = await prisma.menuCategory.findFirst({
      where: {
        slug: categorySlug,
        section: { slug: sectionSlug },
      },
      include: { items: true },
    });
    if (!category) {
      throw new Error(`Category not found: ${sectionSlug}/${categorySlug}`);
    }

    const existing = category.items.find((item) => item.slug === itemSlug);
    const maxSort = category.items.reduce((max, item) => Math.max(max, item.sortOrder), -1);
    const nextSort = existing?.sortOrder ?? maxSort + 1;

    const itemData = {
      name: { hy: hyName, ru: ruName, en: enName },
      price,
      imageUrl: proxyUrl,
      sortOrder: nextSort,
      isActive: true,
      ...(subcategoryData
        ? {
            subcategoryTitle: resolveRestaurantKitchenSubcategoryTitle(
              itemSlug,
              subcategoryData.subcategories,
              subcategoryData.slugToKey,
            ),
          }
        : {}),
    };

    const item = existing
      ? await prisma.menuItem.update({
          where: { id: existing.id },
          data: itemData,
          select: { id: true, slug: true, imageUrl: true, name: true, price: true },
        })
      : await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            slug: itemSlug,
            ...itemData,
          },
          select: { id: true, slug: true, imageUrl: true, name: true, price: true },
        });

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          category: `${sectionSlug}/${categorySlug}`,
          action: existing ? 'updated' : 'created',
          item,
          r2Key: objectKey,
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
