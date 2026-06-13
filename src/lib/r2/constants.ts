/** Prefix for publicly servable menu images in the R2 bucket. */
export const R2_MENU_IMAGE_KEY_PREFIX = 'menu-items/';

/** Max S3 object key length per AWS limits. */
export const R2_OBJECT_KEY_MAX_LENGTH = 1024;

export const R2_ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

export const R2_ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
