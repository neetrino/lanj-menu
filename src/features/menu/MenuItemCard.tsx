import Image from 'next/image';
import { formatPrice } from '@/lib/menu/format-price';
import type { MenuItemPayload } from '@/lib/menu/types';
import { MENU_CARD_HEIGHT_PX, MENU_CARD_RADIUS_PX } from './constants';
import { ArrowUpRightIcon } from './icons/ArrowUpRightIcon';

type Props = {
  item: MenuItemPayload;
  sectionLabel: string;
};

export function MenuItemCard({ item, sectionLabel }: Props) {
  const price = formatPrice(item.price);

  return (
    <article
      className="relative isolate overflow-hidden bg-surface-card shadow-[0_4px_24px_rgba(44,24,16,0.12)]"
      style={{
        height: `${MENU_CARD_HEIGHT_PX}px`,
        borderRadius: `${MENU_CARD_RADIUS_PX}px`,
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
        {sectionLabel}
      </span>

      <button
        type="button"
        aria-label={`View ${item.name}`}
        className={[
          'absolute right-3.5 top-3.5 flex items-center justify-center',
          'size-10 rounded-[20px] bg-[rgba(255,248,243,0.92)] text-text-primary',
          'shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
        ].join(' ')}
      >
        <ArrowUpRightIcon />
      </button>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-[17.6px] pt-4">
        <h3 className="font-display text-[18.4px] font-bold leading-[1.25] text-surface-cream">
          {item.name}
        </h3>

        <div className="mt-1 flex items-center justify-between gap-3 pt-1">
          <span className="min-w-0 flex-1" />
          {price && (
            <p className="shrink-0 text-base font-bold text-brand-price" aria-label={`Price: ${price}`}>
              {price}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
