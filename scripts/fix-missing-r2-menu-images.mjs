import path from 'node:path';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const DEFAULT_FALLBACK_OBJECT_KEY = 'menu-items/pool-menu-drinks-placeholder-v2.png';

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

async function objectExists(s3, bucket, objectKey) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      }),
    );
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
      select: { id: true, slug: true, imageUrl: true },
    });

    const keyCache = new Map();
    let fallbackObjectKey = DEFAULT_FALLBACK_OBJECT_KEY;
    let fallbackExists = await objectExists(s3, bucket, fallbackObjectKey);
    const broken = [];
    let firstExistingObjectKey = null;

    for (const item of items) {
      const objectKey = parseR2ObjectKey(item.imageUrl);
      if (!objectKey) continue;

      let exists = keyCache.get(objectKey);
      if (exists === undefined) {
        exists = await objectExists(s3, bucket, objectKey);
        keyCache.set(objectKey, exists);
      }

      if (!exists) {
        broken.push(item);
      } else if (!firstExistingObjectKey) {
        firstExistingObjectKey = objectKey;
      }
    }

    if (!fallbackExists && firstExistingObjectKey) {
      fallbackObjectKey = firstExistingObjectKey;
      fallbackExists = true;
    }
    if (!fallbackExists) {
      throw new Error('Could not find any existing R2 image to use as fallback');
    }

    if (broken.length === 0) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            updated: 0,
            message: 'No broken R2 image references found',
          },
          null,
          2,
        ),
      );
      return;
    }

    const fallbackProxyUrl = `/api/r2/image?key=${encodeURIComponent(fallbackObjectKey)}`;
    for (const item of broken) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: fallbackProxyUrl },
      });
    }

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          fallbackObjectKey,
          updated: broken.length,
          slugs: broken.map((item) => item.slug),
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
