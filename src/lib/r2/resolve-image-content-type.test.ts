import { describe, expect, it } from 'vitest';
import { resolveImageContentType } from './resolve-image-content-type';

describe('resolveImageContentType', () => {
  it('returns stored image content types when allowed', () => {
    expect(resolveImageContentType('menu-items/item.jpg', 'image/jpeg')).toBe('image/jpeg');
    expect(resolveImageContentType('menu-items/item.png', 'image/png; charset=utf-8')).toBe(
      'image/png',
    );
  });

  it('infers content type from extension when stored type is missing', () => {
    expect(resolveImageContentType('menu-items/item.webp', undefined)).toBe('image/webp');
    expect(resolveImageContentType('menu-items/item.jpeg', 'application/octet-stream')).toBe(
      'image/jpeg',
    );
  });

  it('rejects unsupported keys', () => {
    expect(resolveImageContentType('menu-items/item.exe', 'application/octet-stream')).toBe(null);
    expect(resolveImageContentType('menu-items/item.jpg', 'text/html')).toBe('image/jpeg');
  });
});
