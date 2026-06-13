import { describe, expect, it } from 'vitest';
import { isAllowedR2ObjectKey } from './validate-object-key';

describe('isAllowedR2ObjectKey', () => {
  it('allows valid menu image keys', () => {
    expect(isAllowedR2ObjectKey('menu-items/lahmajo-1718280000000-a1b2c3d4.jpg')).toBe(true);
    expect(isAllowedR2ObjectKey('menu-items/item-name.png')).toBe(true);
    expect(isAllowedR2ObjectKey('menu-items/item-name.webp')).toBe(true);
  });

  it('rejects keys outside the menu-items prefix', () => {
    expect(isAllowedR2ObjectKey('backups/db.sql')).toBe(false);
    expect(isAllowedR2ObjectKey('menu-items')).toBe(false);
    expect(isAllowedR2ObjectKey('other/menu-items/file.jpg')).toBe(false);
  });

  it('rejects traversal and unsafe segments', () => {
    expect(isAllowedR2ObjectKey('menu-items/../secret.jpg')).toBe(false);
    expect(isAllowedR2ObjectKey('menu-items//file.jpg')).toBe(false);
    expect(isAllowedR2ObjectKey('menu-items/.hidden.jpg')).toBe(false);
    expect(isAllowedR2ObjectKey('')).toBe(false);
  });

  it('rejects unsupported extensions', () => {
    expect(isAllowedR2ObjectKey('menu-items/file.exe')).toBe(false);
    expect(isAllowedR2ObjectKey('menu-items/file.svg')).toBe(false);
    expect(isAllowedR2ObjectKey('menu-items/file.bin')).toBe(false);
  });
});
