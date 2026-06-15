import path from 'node:path';
import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const LOCAL_FILE_PATH = path.resolve(
  process.cwd(),
  'public/images/placeholders/pool-menu-drinks-placeholder.webp',
);
const R2_OBJECT_KEY = 'menu-items/pool-menu-drinks-placeholder.webp';

function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

async function main() {
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY');
  const bucket = getRequiredEnv('R2_BUCKET_NAME');
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim() ?? '';

  const body = await fs.readFile(LOCAL_FILE_PATH);

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: R2_OBJECT_KEY,
      Body: body,
      ContentType: 'image/webp',
    }),
  );

  const publicUrl = r2PublicUrl
    ? `${r2PublicUrl.replace(/\/$/, '')}/${R2_OBJECT_KEY}`
    : null;

  console.log(
    JSON.stringify(
      {
        ok: true,
        bucket,
        key: R2_OBJECT_KEY,
        contentType: 'image/webp',
        bytes: body.length,
        publicUrl,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
