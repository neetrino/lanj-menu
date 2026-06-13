/**
 * Syncs restaurant/kitchen menu items from data/restaurant-daily-menu-items.json:
 * - optimizes photos to WebP (max 1000px, up to 1500px if still under 50 KB)
 * - replaces all objects under menu-items/ in R2
 * - replaces DB items with translated names and proxy image URLs
 *
 * Run: node scripts/sync-menu-items.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import dotenv from 'dotenv';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const execFileAsync = promisify(execFile);

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const PHOTOS_DIR = path.resolve(process.cwd(), 'Photos');
const OPTIMIZED_DIR = path.resolve(process.cwd(), '.tmp/optimized-menu-photos');
const CATALOG_PATH = path.resolve(process.cwd(), 'data/restaurant-daily-menu-items.json');
const R2_PREFIX = 'menu-items/';

const MAX_DIMENSION_PRIMARY = 1000;
const MAX_DIMENSION_FALLBACK = 1500;
const MAX_DIMENSION_COMPACT = 900;
const MAX_FILE_BYTES = 50 * 1024;
const WEBP_QUALITIES = [82, 74, 66, 58, 50, 42, 34, 28];

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}


async function resizeImage(inputPath, outputPath, maxDimension) {
  await execFileAsync('sips', ['-Z', String(maxDimension), inputPath, '--out', outputPath]);
}

async function encodeWebp(inputPath, outputPath, quality) {
  await execFileAsync('cwebp', ['-q', String(quality), inputPath, '-o', outputPath]);
}

async function optimizePhoto(sourceFileName) {
  const sourcePath = path.join(PHOTOS_DIR, sourceFileName);
  await fs.access(sourcePath);

  const outputPath = path.join(OPTIMIZED_DIR, `${path.parse(sourceFileName).name}.webp`);
  const resizeTargets = [MAX_DIMENSION_PRIMARY, MAX_DIMENSION_FALLBACK, MAX_DIMENSION_COMPACT];

  let best = null;

  for (const maxDimension of resizeTargets) {
    const resizedPath = path.join(OPTIMIZED_DIR, `${sourceFileName}.${maxDimension}.jpg`);
    await resizeImage(sourcePath, resizedPath, maxDimension);

    for (const quality of WEBP_QUALITIES) {
      await encodeWebp(resizedPath, outputPath, quality);
      const stat = await fs.stat(outputPath);
      const candidate = { quality, bytes: stat.size, outputPath, maxDimension };

      if (!best || candidate.bytes < best.bytes) {
        best = candidate;
      }

      if (stat.size <= MAX_FILE_BYTES) {
        return best;
      }
    }
  }

  if (!best) {
    throw new Error(`Failed to optimize ${sourceFileName}`);
  }

  return best;
}

async function clearR2Prefix(s3, bucket) {
  let token;
  const keys = [];

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: R2_PREFIX,
        ContinuationToken: token,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) {
        keys.push(object.Key);
      }
    }

    token = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (token);

  if (keys.length === 0) {
    return 0;
  }

  for (let index = 0; index < keys.length; index += 1000) {
    const chunk = keys.slice(index, index + 1000);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }

  return keys.length;
}

async function uploadOptimizedPhotos(s3, bucket, items) {
  const uniquePhotos = [...new Set(items.map((item) => item.photo))];
  const uploads = new Map();

  for (const photo of uniquePhotos) {
    const optimized = await optimizePhoto(photo);
    const slugForPhoto = items.find((item) => item.photo === photo)?.slug ?? path.parse(photo).name;
    const objectKey = `${R2_PREFIX}${slugForPhoto}.webp`;

    const body = await fs.readFile(optimized.outputPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: body,
        ContentType: 'image/webp',
      }),
    );

    uploads.set(photo, {
      objectKey,
      bytes: optimized.bytes,
      quality: optimized.quality,
      proxyUrl: `/api/r2/image?key=${encodeURIComponent(objectKey)}`,
    });
  }

  return uploads;
}

async function main() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');

  const rawCatalog = await fs.readFile(CATALOG_PATH, 'utf8');
  const catalog = JSON.parse(rawCatalog);

  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error('Catalog is empty');
  }

  await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const deleted = await clearR2Prefix(s3, bucket);
  const uploads = await uploadOptimizedPhotos(s3, bucket, catalog);

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    const category = await prisma.menuCategory.findFirst({
      where: {
        slug: 'kitchen',
        section: { slug: 'restaurant' },
      },
    });

    if (!category) {
      throw new Error('restaurant/kitchen category not found — run pnpm db:seed first');
    }

    await prisma.menuItem.deleteMany({ where: { categoryId: category.id } });

    const created = [];
    for (const [index, item] of catalog.entries()) {
      const upload = uploads.get(item.photo);
      if (!upload) {
        throw new Error(`Missing upload for photo ${item.photo}`);
      }

      const row = await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          slug: item.slug,
          name: item.name,
          imageUrl: upload.proxyUrl,
          price: item.price,
          sortOrder: index,
          isActive: true,
        },
      });

      created.push({
        slug: row.slug,
        price: row.price,
        name: row.name,
        imageUrl: row.imageUrl,
        photo: item.photo,
        optimizedBytes: upload.bytes,
        optimizedQuality: upload.quality,
      });
    }

    await rebuildMenuSnapshots(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          deletedR2Objects: deleted,
          uploadedPhotos: uploads.size,
          items: created.length,
          catalog: created,
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
