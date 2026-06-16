import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { rebuildMenuSnapshots } from './rebuild-menu-snapshots.mjs';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const ASSETS_DIR = 'C:/Users/LOQ/.cursor/projects/c-AI-lanj-menu/assets';

const IMG_TO_SLUG = {
  '8741': 'pasta-carbonara',
  '8742': 'chicken-with-fries',
  '8743': 'viennese-ribs',
  '8744': 'pasta-alfredo',
  '8745': 'pasta-shrimp',
  '8747': 'beef-medallions',
  '8748': 'whitefish-tarragon',
  '8749': 'lanj-salad',
  '8751': 'lamb-shoulder-arishta',
  '8754': 'lamb-macha-flatbread',
  '8755': 'bbq-set',
  '8756': 'beef-shank',
  '8757': 'seafood-platter',
  '8759': 'salmon-risotto',
  '8760': 'chicken-roast-beef',
  '8762': 'quail',
  '8763': 'mushroom-cream-soup',
  '8764': 'pumpkin-cream-soup',
  '8765': 'stuffed-vegetables',
  '8766': 'chicken-breast-cream',
  '8767': 'chicken-soup',
  '8769': 'thai-beef',
  '8770': 'quinoa-chicken',
  '8774': 'greek-salad',
  '8775': 'shrimp-tempura',
  '8776': 'calamari-rings',
  '8777': 'beef-tail-khashlama',
  '8778': 'lamb-khashlama',
  '8781': 'olives',
  '8782': 'salmon-bruschetta',
  '8783': 'vegetable-bouquet',
  '8784': 'caprese',
  '8787': 'shrimp-caesar',
  '8790': 'european-cheese-board',
  '8792': 'tomato-bruschetta',
  '8794': 'appetizer-set',
};

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function extractImgCode(fileName) {
  const match = fileName.match(/IMG_(\d{4})/);
  return match ? match[1] : null;
}

function choosePreferredFile(existingName, nextName) {
  if (!existingName) return nextName;
  const existingIsDup = existingName.includes('__1_');
  const nextIsDup = nextName.includes('__1_');
  if (existingIsDup && !nextIsDup) return nextName;
  return existingName;
}

async function collectPreferredFilesByImgCode() {
  const names = await fs.readdir(ASSETS_DIR);
  const byCode = new Map();
  for (const name of names) {
    const code = extractImgCode(name);
    if (!code) continue;
    byCode.set(code, choosePreferredFile(byCode.get(code), name));
  }
  return byCode;
}

function getContentTypeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/png';
}

async function main() {
  const databaseUrl = getRequiredEnv('DATABASE_URL');
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');

  const filesByCode = await collectPreferredFilesByImgCode();
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  const report = {
    uploaded: [],
    skippedMissingFile: [],
    skippedMissingItem: [],
  };

  try {
    const slugs = Object.values(IMG_TO_SLUG);
    const items = await prisma.menuItem.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true, imageUrl: true },
    });
    const itemBySlug = new Map(items.map((item) => [item.slug, item]));

    for (const [imgCode, slug] of Object.entries(IMG_TO_SLUG)) {
      const fileName = filesByCode.get(imgCode);
      if (!fileName) {
        report.skippedMissingFile.push({ imgCode, slug });
        continue;
      }

      const item = itemBySlug.get(slug);
      if (!item) {
        report.skippedMissingItem.push({ imgCode, slug, fileName });
        continue;
      }

      const absPath = path.join(ASSETS_DIR, fileName);
      const body = await fs.readFile(absPath);
      const unique = crypto.randomBytes(4).toString('hex');
      const objectKey = `menu-items/${slug}-${Date.now()}-${unique}.png`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          Body: body,
          ContentType: getContentTypeFromPath(absPath),
        }),
      );

      const proxyUrl = `/api/r2/image?key=${encodeURIComponent(objectKey)}`;
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { imageUrl: proxyUrl },
      });

      report.uploaded.push({ slug, imgCode, fileName, objectKey });
    }

    await rebuildMenuSnapshots(prisma);
    console.log(JSON.stringify({ ok: true, ...report }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
