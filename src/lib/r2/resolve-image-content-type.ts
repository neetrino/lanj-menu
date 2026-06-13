import {
  R2_ALLOWED_IMAGE_CONTENT_TYPES,
  R2_ALLOWED_IMAGE_EXTENSIONS,
} from './constants';

const EXTENSION_TO_CONTENT_TYPE: Record<
  (typeof R2_ALLOWED_IMAGE_EXTENSIONS)[number],
  (typeof R2_ALLOWED_IMAGE_CONTENT_TYPES)[number]
> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/**
 * Returns a safe image Content-Type for proxied R2 objects.
 * Rejects non-image stored types unless they match an allowed file extension.
 */
export function resolveImageContentType(
  key: string,
  storedContentType: string | undefined,
): string | null {
  const extension = key.split('.').pop()?.toLowerCase();
  if (!extension || !(R2_ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(extension)) {
    return null;
  }

  const normalizedStoredType = storedContentType?.split(';')[0]?.trim().toLowerCase();
  if (
    normalizedStoredType &&
    (R2_ALLOWED_IMAGE_CONTENT_TYPES as readonly string[]).includes(normalizedStoredType)
  ) {
    return normalizedStoredType;
  }

  return EXTENSION_TO_CONTENT_TYPE[extension as keyof typeof EXTENSION_TO_CONTENT_TYPE] ?? null;
}
