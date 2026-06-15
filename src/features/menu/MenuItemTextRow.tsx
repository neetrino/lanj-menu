import { formatPrice } from '@/lib/menu/format-price';
import type { MenuItemPayload } from '@/lib/menu/types';

type Props = {
  item: MenuItemPayload;
};

export function MenuItemTextRow({ item }: Props) {
  const price = formatPrice(item.price);
  const hasPrice = price.length > 0;

  return (
    <article className="flex items-end gap-2 py-2.5 text-text-primary">
      <h3 className="min-w-0 shrink break-words text-[15px] font-medium leading-6 sm:text-base">
        {item.name}
      </h3>
      {hasPrice && (
        <>
          <span
            className="mb-[0.35rem] min-w-3 flex-1 border-b border-dashed border-black/20"
            aria-hidden="true"
          />
          <p className="shrink-0 whitespace-nowrap text-[15px] font-semibold leading-6 sm:text-base">
            {price}
          </p>
        </>
      )}
    </article>
  );
}
