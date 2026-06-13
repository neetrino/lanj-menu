import { useCallback, useEffect, useState } from 'react';
import type { MenuItemPayload } from '@/lib/menu/types';
import { MENU_ITEMS_PAGE_SIZE } from './constants';

export function useMenuItemsPagination(items: MenuItemPayload[]) {
  const [visibleCount, setVisibleCount] = useState(MENU_ITEMS_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(MENU_ITEMS_PAGE_SIZE);
  }, [items]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + MENU_ITEMS_PAGE_SIZE, items.length));
  }, [items.length]);

  return { visibleItems, hasMore, loadMore };
}
