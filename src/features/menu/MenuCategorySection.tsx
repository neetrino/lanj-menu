import { MenuItemCard } from './MenuItemCard';
import { EmptyState } from './EmptyState';
import type { MenuCategoryPayload } from '@/lib/menu/types';

type Props = {
  category: MenuCategoryPayload;
  emptyMessage?: string;
};

export function MenuCategorySection({ category, emptyMessage }: Props) {
  return (
    <section
      id={`category-${category.slug}`}
      className="scroll-mt-32 pt-4 pb-2"
      aria-labelledby={`heading-${category.slug}`}
    >
      <h2
        id={`heading-${category.slug}`}
        className="text-base font-bold text-[#4a2000] px-4 mb-3 tracking-wide uppercase opacity-80"
      >
        {category.title}
      </h2>

      {category.items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="flex flex-col gap-2 px-4" role="list">
          {category.items.map((item) => (
            <li key={item.slug}>
              <MenuItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
