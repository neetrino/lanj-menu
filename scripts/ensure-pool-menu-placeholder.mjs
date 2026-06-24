import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand, PutObjectCommand, CopyObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

export const R2_PLACEHOLDER_KEY = 'menu-items/pool-menu-drinks-placeholder.webp';
const LOCAL_FILE_PATH = path.resolve(
  process.cwd(),
  'public/images/placeholders/pool-menu-drinks-placeholder.webp',
);

/** Minimal valid 1×1 WebP — used when no local placeholder asset is present. */
const FALLBACK_WEBP = Buffer.from(
  'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
  'base64',
);

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

async function objectExists(s3, bucket, objectKey) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    return true;
  } catch {
    return false;
  }
}

async function readPlaceholderBody() {
  try {
    return await fs.readFile(LOCAL_FILE_PATH);
  } catch {
    return FALLBACK_WEBP;
  }
}

async function findCopySourceKey(s3, bucket) {
  const listed = await s3.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: 'menu-items/', MaxKeys: 50 }),
  );
  return (
    listed.Contents?.find(
      (entry) =>
        entry.Key &&
        entry.Key !== R2_PLACEHOLDER_KEY &&
        entry.Key.endsWith('.png') &&
        (entry.Size ?? 0) > 10_000,
    )?.Key ?? null
  );
}

async function main() {
  const force = process.argv.includes('--force');
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim() ?? '';

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const alreadyExists = await objectExists(s3, bucket, R2_PLACEHOLDER_KEY);
  if (alreadyExists && !force) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          action: 'skipped',
          key: R2_PLACEHOLDER_KEY,
          proxyUrl: resolveSharedImageProxyUrl(),
          publicUrl: r2PublicUrl
            ? `${r2PublicUrl.replace(/\/$/, '')}/${R2_PLACEHOLDER_KEY}`
            : null,
        },
        null,
        2,
      ),
    );
    return;
  }

  const copySourceKey = await findCopySourceKey(s3, bucket);
  if (copySourceKey) {
    await s3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: R2_PLACEHOLDER_KEY,
        CopySource: `${bucket}/${copySourceKey}`,
        ContentType: 'image/webp',
        MetadataDirective: 'REPLACE',
      }),
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          action: force ? 'replaced-from-copy' : 'uploaded-from-copy',
          key: R2_PLACEHOLDER_KEY,
          copySourceKey,
          proxyUrl: resolveSharedImageProxyUrl(),
          publicUrl: r2PublicUrl
            ? `${r2PublicUrl.replace(/\/$/, '')}/${R2_PLACEHOLDER_KEY}`
            : null,
        },
        null,
        2,
      ),
    );
    return;
  }

  const body = await readPlaceholderBody();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: R2_PLACEHOLDER_KEY,
      Body: body,
      ContentType: 'image/webp',
    }),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: 'uploaded',
        key: R2_PLACEHOLDER_KEY,
        bytes: body.length,
        source: body === FALLBACK_WEBP ? 'embedded-fallback' : LOCAL_FILE_PATH,
        proxyUrl: resolveSharedImageProxyUrl(),
        publicUrl: r2PublicUrl
          ? `${r2PublicUrl.replace(/\/$/, '')}/${R2_PLACEHOLDER_KEY}`
          : null,
      },
      null,
      2,
    ),
  );
}

const isDirectRun = process.argv[1]?.endsWith('ensure-pool-menu-placeholder.mjs');
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
