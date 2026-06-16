import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

  if (!imagePath || !itemSlug) {
    throw new Error('Usage: node scripts/update-menu-item-image.mjs "<imagePath>" "<itemSlug>"');
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
    const item = await prisma.menuItem.findFirst({
      where: { slug: itemSlug },
      select: { id: true },
    });
    if (!item) {
      throw new Error(`Menu item not found by slug: ${itemSlug}`);
    }

    const updated = await prisma.menuItem.update({
      where: { id: item.id },
      data: { imageUrl: proxyUrl },
      select: { id: true, slug: true, imageUrl: true, name: true },
    });

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          item: updated,
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
