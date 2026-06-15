'use client';

import { useEffect, useRef } from 'react';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemTextRow } from './MenuItemTextRow';
import { useMenuItemsPagination } from './use-menu-items-pagination';
import { MENU_CARD_WIDTH_PX, MENU_ITEMS_SCROLL_ROOT_MARGIN } from './constants';
import type { MenuItemPayload } from '@/lib/menu/types';
import type { MenuViewMode } from '@/lib/menu/types';

type Props = {
  items: MenuItemPayload[];
  categoryLabel: string;
  categorySlug: string;
  viewMode: MenuViewMode;
};

export function MenuCategoryItemList({ items, categoryLabel, categorySlug, viewMode }: Props) {
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
      <ul
        className={
          viewMode === 'cards'
            ? 'flex flex-col gap-4 lg:grid lg:justify-between lg:gap-x-6 lg:gap-y-5 lg:[grid-template-columns:repeat(auto-fill,var(--menu-card-width))]'
            : 'flex flex-col divide-y divide-black/5'
        }
        style={{ ['--menu-card-width' as string]: `${MENU_CARD_WIDTH_PX}px` }}
        role="list"
      >
        {visibleItems.map((item) => (
          <li key={item.slug} className={viewMode === 'cards' ? 'w-full lg:w-auto' : 'w-full'}>
            {viewMode === 'cards' ? (
              <MenuItemCard item={item} categoryLabel={categoryLabel} />
            ) : (
              <MenuItemTextRow item={item} />
            )}
          </li>
        ))}
      </ul>
      {hasMore && <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />}
    </>
  );
}
