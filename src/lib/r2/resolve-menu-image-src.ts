const R2_IMAGE_PROXY_PREFIX = '/api/r2/image?key=';

/**
 * Converts proxied menu image URLs to absolute R2 public URLs for `next/image`.
 * Next.js 15 rejects local `/api/...?key=` sources in the image optimizer (400).
 */
export function resolveMenuImageSrc(imageUrl: string): string {
  if (!imageUrl.startsWith(R2_IMAGE_PROXY_PREFIX)) {
    return imageUrl;
  }

  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, '');
  if (!r2PublicUrl) {
    return imageUrl;
  }

  const encodedKey = imageUrl.slice(R2_IMAGE_PROXY_PREFIX.length);
  const key = decodeURIComponent(encodedKey);
  return `${r2PublicUrl}/${key}`;
}
