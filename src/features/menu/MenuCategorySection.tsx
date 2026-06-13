import { MenuCategoryItemList } from './MenuCategoryItemList';
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
        <MenuCategoryItemList
          items={category.items}
          sectionLabel={sectionLabel}
          categorySlug={category.slug}
        />
      )}
    </section>
  );
}
