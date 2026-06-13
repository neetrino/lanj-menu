'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCategoryVisibleCount,
  setCategoryVisibleCount,
} from '@/lib/menu/menu-ui-state';
import type { MenuItemPayload } from '@/lib/menu/types';
import { MENU_ITEMS_PAGE_SIZE } from './constants';

function resolveInitialVisibleCount(categorySlug: string, itemCount: number): number {
  const saved = getCategoryVisibleCount(categorySlug);
  if (saved !== undefined && saved >= MENU_ITEMS_PAGE_SIZE) {
    return Math.min(saved, itemCount);
  }
  return Math.min(MENU_ITEMS_PAGE_SIZE, itemCount);
}

export function useMenuItemsPagination(items: MenuItemPayload[], categorySlug: string) {
  const [visibleCount, setVisibleCount] = useState(() =>
    resolveInitialVisibleCount(categorySlug, items.length),
  );

  useEffect(() => {
    setVisibleCount(resolveInitialVisibleCount(categorySlug, items.length));
  }, [categorySlug, items.length]);

  useEffect(() => {
    setCategoryVisibleCount(categorySlug, visibleCount);
  }, [categorySlug, visibleCount]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + MENU_ITEMS_PAGE_SIZE, items.length));
  }, [items.length]);

  return { visibleItems, hasMore, loadMore };
}
