import {
  R2_ALLOWED_IMAGE_EXTENSIONS,
  R2_MENU_IMAGE_KEY_PREFIX,
  R2_OBJECT_KEY_MAX_LENGTH,
} from './constants';

const SAFE_KEY_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i;

/**
 * Validates an R2 object key before proxying it to clients.
 * Only menu image keys under the configured prefix are allowed.
 */
export function isAllowedR2ObjectKey(key: string): boolean {
  if (!key || key.length > R2_OBJECT_KEY_MAX_LENGTH) {
    return false;
  }

  if (!key.startsWith(R2_MENU_IMAGE_KEY_PREFIX)) {
    return false;
  }

  if (key.includes('..') || key.includes('//')) {
    return false;
  }

  const relativeKey = key.slice(R2_MENU_IMAGE_KEY_PREFIX.length);
  if (!relativeKey) {
    return false;
  }

  const segments = relativeKey.split('/');
  if (segments.some((segment) => !segment || !SAFE_KEY_SEGMENT_PATTERN.test(segment))) {
    return false;
  }

  const filename = segments[segments.length - 1];
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension || !(R2_ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(extension)) {
    return false;
  }

  return true;
}
