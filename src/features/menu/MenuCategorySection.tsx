import { MenuItemCard } from './MenuItemCard';
import { EmptyState } from './EmptyState';
import type { MenuCategoryPayload } from '@/lib/menu/types';

type Props = {
  category: MenuCategoryPayload;
  sectionLabel: string;
  emptyMessage?: string;
};

export function MenuCategorySection({ category, sectionLabel, emptyMessage }: Props) {
  return (
    <section
      id={`category-${category.slug}`}
      className="scroll-mt-32"
      aria-labelledby={`heading-${category.slug}`}
    >
      <h2 id={`heading-${category.slug}`} className="sr-only">
        {category.title}
      </h2>

      {category.items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5" role="list">
          {category.items.map((item) => (
            <li key={item.slug}>
              <MenuItemCard item={item} sectionLabel={sectionLabel} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
