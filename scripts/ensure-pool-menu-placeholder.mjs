import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

/** Versioned key busts stale CDN / _next/image caches when the placeholder changes. */
export const R2_PLACEHOLDER_KEY = 'menu-items/pool-menu-drinks-placeholder-v2.png';

const LEGACY_PLACEHOLDER_MARKERS = ['pool-menu-drinks-placeholder.webp'];

const LOCAL_CANDIDATES = [
  'public/images/placeholders/pool-menu-drinks-placeholder.png',
  'public/images/placeholders/pool-menu-drinks-placeholder.webp',
  'public/images/placeholders/pool-menu-drinks-placeholder.jpg',
  'public/images/placeholders/pool-menu-drinks-placeholder.jpeg',
].map((relativePath) => path.resolve(process.cwd(), relativePath));

const EXTENSION_CONTENT_TYPE = {
  webp: 'image/webp',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export function resolveSharedImageProxyUrl() {
  return `/api/r2/image?key=${encodeURIComponent(R2_PLACEHOLDER_KEY)}`;
}

function isLegacyPlaceholderUrl(imageUrl) {
  if (!imageUrl) return false;
  if (imageUrl.includes(R2_PLACEHOLDER_KEY)) return false;
  return LEGACY_PLACEHOLDER_MARKERS.some((marker) => imageUrl.includes(marker));
}

async function objectExists(s3, bucket, objectKey) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    return true;
  } catch {
    return false;
  }
}

async function readLocalPlaceholder() {
  for (const filePath of LOCAL_CANDIDATES) {
    try {
      const body = await fs.readFile(filePath);
      const extension = filePath.split('.').pop()?.toLowerCase() ?? '';
      const contentType = EXTENSION_CONTENT_TYPE[extension];
      if (!contentType) continue;
      return { body, contentType, filePath };
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function rebindLegacyPlaceholderReferences(prisma) {
  const items = await prisma.menuItem.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, slug: true, imageUrl: true },
  });

  const proxyUrl = resolveSharedImageProxyUrl();
  const legacyItems = items.filter((item) => isLegacyPlaceholderUrl(item.imageUrl));
  for (const item of legacyItems) {
    await prisma.menuItem.update({
      where: { id: item.id },
      data: { imageUrl: proxyUrl },
    });
  }

  if (legacyItems.length > 0) {
    await rebuildMenuSnapshots(prisma);
  }

  return { updated: legacyItems.length, slugs: legacyItems.map((item) => item.slug) };
}

async function main() {
  const force = process.argv.includes('--force');
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim() ?? '';

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const localPlaceholder = await readLocalPlaceholder();
  if (!localPlaceholder) {
    throw new Error(
      'Missing local placeholder. Add public/images/placeholders/pool-menu-drinks-placeholder.png',
    );
  }

  const alreadyExists = await objectExists(s3, bucket, R2_PLACEHOLDER_KEY);
  if (!alreadyExists || force) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: R2_PLACEHOLDER_KEY,
        Body: localPlaceholder.body,
        ContentType: localPlaceholder.contentType,
      }),
    );
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  try {
    const rebindSummary = await rebindLegacyPlaceholderReferences(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          action: alreadyExists && !force ? 'rebound-only' : force ? 'replaced-from-local' : 'uploaded-from-local',
          key: R2_PLACEHOLDER_KEY,
          bytes: localPlaceholder.body.length,
          source: localPlaceholder.filePath,
          proxyUrl: resolveSharedImageProxyUrl(),
          publicUrl: r2PublicUrl
            ? `${r2PublicUrl.replace(/\/$/, '')}/${R2_PLACEHOLDER_KEY}`
            : null,
          rebind: rebindSummary,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun = process.argv[1]?.endsWith('ensure-pool-menu-placeholder.mjs');
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
