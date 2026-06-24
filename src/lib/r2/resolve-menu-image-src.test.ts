import { afterEach, describe, expect, it } from 'vitest';
import { resolveMenuImageSrc } from './resolve-menu-image-src';

describe('resolveMenuImageSrc', () => {
  afterEach(() => {
    delete process.env.R2_PUBLIC_URL;
  });

  it('passes through absolute URLs unchanged', () => {
    const url = 'https://cdn.example.com/menu-items/item.png';
    expect(resolveMenuImageSrc(url)).toBe(url);
  });

  it('converts proxied keys to R2 public URLs', () => {
    process.env.R2_PUBLIC_URL = 'https://pub-test.r2.dev/';
    expect(
      resolveMenuImageSrc('/api/r2/image?key=menu-items%2Fpool-menu-drinks-placeholder.webp'),
    ).toBe('https://pub-test.r2.dev/menu-items/pool-menu-drinks-placeholder.webp');
  });

  it('returns proxy URL when R2_PUBLIC_URL is missing', () => {
    const proxy = '/api/r2/image?key=menu-items%2Fitem.png';
    expect(resolveMenuImageSrc(proxy)).toBe(proxy);
  });
});
