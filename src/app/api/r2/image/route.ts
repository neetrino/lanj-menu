import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

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

  try {
    const data = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const body = data.Body;
    if (!body) {
      return NextResponse.json({ error: 'Image body is empty' }, { status: 404 });
    }

    return new Response(body as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': data.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
