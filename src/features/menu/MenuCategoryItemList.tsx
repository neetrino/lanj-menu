'use client';

import { useEffect, useRef } from 'react';
import { MenuItemCard } from './MenuItemCard';
import { useMenuItemsPagination } from './use-menu-items-pagination';
import { MENU_ITEMS_SCROLL_ROOT_MARGIN } from './constants';
import type { MenuItemPayload } from '@/lib/menu/types';

type Props = {
  items: MenuItemPayload[];
  categoryLabel: string;
  categorySlug: string;
};

export function MenuCategoryItemList({ items, categoryLabel, categorySlug }: Props) {
  const { visibleItems, hasMore, loadMore } = useMenuItemsPagination(items, categorySlug);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: MENU_ITEMS_SCROLL_ROOT_MARGIN },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, categorySlug]);

  return (
    <>
      <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5" role="list">
        {visibleItems.map((item) => (
          <li key={item.slug}>
            <MenuItemCard item={item} categoryLabel={categoryLabel} />
          </li>
        ))}
      </ul>
      {hasMore && <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />}
    </>
  );
}
