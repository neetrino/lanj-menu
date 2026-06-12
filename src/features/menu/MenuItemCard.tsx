import Image from 'next/image';
import { formatPrice } from '@/lib/menu/format-price';
import type { MenuItemPayload } from '@/lib/menu/types';

type Props = {
  item: MenuItemPayload;
};

export function MenuItemCard({ item }: Props) {
  const price = formatPrice(item.price);

  return (
    <article className="flex gap-3 p-3 bg-white/75 rounded-xl shadow-sm">
      {/* Image / placeholder — fixed 80×80 to prevent layout shift */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-amber-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-amber-100" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-semibold text-[#4a2000] text-sm leading-snug">{item.name}</h3>
        {price && (
          <p className="text-sm font-bold text-brand-header mt-0.5" aria-label={`Price: ${price}`}>
            {price}
          </p>
        )}
      </div>
    </article>
  );
}
