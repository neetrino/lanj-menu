import Image from 'next/image';
import { formatPrice } from '@/lib/menu/format-price';
import type { MenuItemPayload } from '@/lib/menu/types';
import {
  MENU_CARD_HEIGHT_PX,
  MENU_CARD_RADIUS_PX,
  MENU_CARD_WIDTH_PX,
} from './constants';
import { MenuItemPrice } from './MenuItemPrice';

type Props = {
  item: MenuItemPayload;
  categoryLabel: string;
};

export function MenuItemCard({ item, categoryLabel }: Props) {
  const price = formatPrice(item.price);

  return (
    <article
      className="relative isolate w-full overflow-hidden bg-surface-card shadow-[0_4px_24px_rgba(44,24,16,0.12)] lg:w-[var(--menu-card-width)]"
      style={{
        height: `${MENU_CARD_HEIGHT_PX}px`,
        borderRadius: `${MENU_CARD_RADIUS_PX}px`,
        ['--menu-card-width' as string]: `${MENU_CARD_WIDTH_PX}px`,
      }}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(max-width: 430px) 100vw, 50vw"
          className="object-cover"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 bg-surface-card" aria-hidden="true" />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-b from-[rgba(20,10,4,0)] from-[30%] to-[rgba(20,10,4,0.75)]"
        aria-hidden="true"
      />

      <span
        className="absolute left-3.5 top-3.5 rounded-full bg-[rgba(255,248,243,0.88)] px-3 py-[7px] text-[10.88px] font-semibold text-brand-accent"
      >
        {categoryLabel}
      </span>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-[17.6px] pt-4 text-white">
        <h3 className="font-display text-[18.4px] font-bold leading-[1.25]">
          {item.name}
        </h3>

        {price && (
          <div className="flex items-center justify-between pt-1">
            <span className="min-w-0 flex-1" />
            <MenuItemPrice price={price} />
          </div>
        )}
      </div>
    </article>
  );
}
