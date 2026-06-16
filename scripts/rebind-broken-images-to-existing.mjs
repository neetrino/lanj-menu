import path from 'node:path';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function parseR2ObjectKey(imageUrl) {
  if (!imageUrl?.startsWith('/api/r2/image?key=')) {
    return null;
  }
  const query = imageUrl.split('?')[1] ?? '';
  const params = new URLSearchParams(query);
  const key = params.get('key');
  return key ? decodeURIComponent(key) : null;
}

function toProxyUrl(objectKey) {
  return `/api/r2/image?key=${encodeURIComponent(objectKey)}`;
}

async function objectExists(s3, bucket, objectKey) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const items = await prisma.menuItem.findMany({
      where: { isActive: true, imageUrl: { not: null } },
      select: { id: true, slug: true, imageUrl: true, categoryId: true, sortOrder: true },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });

    const keyExistsCache = new Map();
    const categoryFallbackById = new Map();
    const broken = [];

    for (const item of items) {
      const key = parseR2ObjectKey(item.imageUrl);
      if (!key) continue;

      let exists = keyExistsCache.get(key);
      if (exists === undefined) {
        exists = await objectExists(s3, bucket, key);
        keyExistsCache.set(key, exists);
      }

      if (exists) {
        if (!categoryFallbackById.has(item.categoryId)) {
          categoryFallbackById.set(item.categoryId, key);
        }
      } else {
        broken.push(item);
      }
    }

    if (broken.length === 0) {
      console.log(JSON.stringify({ ok: true, updated: 0, message: 'No broken references' }, null, 2));
      return;
    }

    const firstGlobalFallbackKey = Array.from(categoryFallbackById.values())[0];
    if (!firstGlobalFallbackKey) {
      throw new Error('No existing image keys available in DB to rebind broken references');
    }

    const updated = [];
    for (const item of broken) {
      const categoryFallbackKey = categoryFallbackById.get(item.categoryId) ?? firstGlobalFallbackKey;
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: toProxyUrl(categoryFallbackKey) },
      });
      updated.push({ slug: item.slug, key: categoryFallbackKey });
    }

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          updated: updated.length,
          sample: updated.slice(0, 25),
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
