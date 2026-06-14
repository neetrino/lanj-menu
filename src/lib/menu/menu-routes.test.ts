import { describe, expect, it } from 'vitest';
import {
  buildMenuPath,
  isValidMenuRoute,
  listMenuRouteSlugParams,
  resolveMenuTabsFromRoute,
} from './menu-routes';
import type { MenuSectionPayload } from './types';

const SECTIONS: MenuSectionPayload[] = [
  {
    slug: 'pool-menu',
    title: 'Pool Menu',
    categories: [
      { slug: 'bar-menu', title: 'Bar Menu', items: [] },
      { slug: 'kitchen', title: 'Kitchen', items: [] },
    ],
  },
  {
    slug: 'restaurant',
    title: 'Restaurant',
    categories: [
      { slug: 'bar-menu', title: 'Bar Menu', items: [] },
      { slug: 'kitchen', title: 'Kitchen', items: [] },
    ],
  },
];

describe('buildMenuPath', () => {
  it('builds locale-prefixed menu URLs', () => {
    expect(buildMenuPath('en', 'pool-menu', 'kitchen')).toBe('/en/pool-menu/kitchen');
  });
});

describe('isValidMenuRoute', () => {
  it('accepts known section/category pairs', () => {
    expect(isValidMenuRoute(SECTIONS, 'restaurant', 'bar-menu')).toBe(true);
  });

  it('rejects unknown section or category slugs', () => {
    expect(isValidMenuRoute(SECTIONS, 'restaurant', 'desserts')).toBe(false);
    expect(isValidMenuRoute(SECTIONS, 'spa', 'kitchen')).toBe(false);
  });
});

describe('resolveMenuTabsFromRoute', () => {
  it('returns tab slugs for valid routes', () => {
    expect(resolveMenuTabsFromRoute(SECTIONS, 'pool-menu', 'bar-menu')).toEqual({
      sectionSlug: 'pool-menu',
      categorySlug: 'bar-menu',
    });
  });

  it('returns null for invalid routes', () => {
    expect(resolveMenuTabsFromRoute(SECTIONS, 'pool-menu', 'wine')).toBeNull();
  });
});

describe('listMenuRouteSlugParams', () => {
  it('lists every section/category combination', () => {
    expect(listMenuRouteSlugParams(SECTIONS)).toEqual([
      { sectionSlug: 'pool-menu', categorySlug: 'bar-menu' },
      { sectionSlug: 'pool-menu', categorySlug: 'kitchen' },
      { sectionSlug: 'restaurant', categorySlug: 'bar-menu' },
      { sectionSlug: 'restaurant', categorySlug: 'kitchen' },
    ]);
  });
});
