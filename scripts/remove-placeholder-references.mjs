import path from 'node:path';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const PLACEHOLDER_TOKEN = 'french-langette-1781613692396-7ae38105.png';

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function toProxyUrl(objectKey) {
  return `/api/r2/image?key=${encodeURIComponent(objectKey)}`;
}

async function objectExists(s3, bucket, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
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
      where: { isActive: true, imageUrl: { contains: PLACEHOLDER_TOKEN } },
      select: { id: true, slug: true, imageUrl: true },
    });

    const updates = [];
    for (const item of items) {
      const preferredKey = `menu-items/${item.slug}.webp`;
      const hasPreferred = await objectExists(s3, bucket, preferredKey);

      if (hasPreferred) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { imageUrl: toProxyUrl(preferredKey) },
        });
        updates.push({ slug: item.slug, mode: 'mapped-to-own-webp', key: preferredKey });
      } else {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { imageUrl: null },
        });
        updates.push({ slug: item.slug, mode: 'cleared-image' });
      }
    }

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          checked: items.length,
          updated: updates.length,
          mappedToOwnWebp: updates.filter((u) => u.mode === 'mapped-to-own-webp').length,
          clearedImage: updates.filter((u) => u.mode === 'cleared-image').length,
          sample: updates.slice(0, 30),
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
