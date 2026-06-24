import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { resolveImageContentType } from '@/lib/r2/resolve-image-content-type';
import { isAllowedR2ObjectKey } from '@/lib/r2/validate-object-key';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;

const r2Client =
  accountId && accessKeyId && secretAccessKey
    ? new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      })
    : null;

export async function GET(request: Request): Promise<Response> {
  if (!r2Client || !bucket) {
    return NextResponse.json({ error: 'R2 is not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing image key' }, { status: 400 });
  }

  if (!isAllowedR2ObjectKey(key)) {
    return NextResponse.json({ error: 'Invalid image key' }, { status: 403 });
  }

  try {
    const data = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const body = data.Body;
    if (!body) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const contentType = resolveImageContentType(key, data.ContentType);
    if (!contentType) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 });
    }

    return new Response(body as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        ...(data.ETag ? { ETag: data.ETag } : {}),
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
