'use client';

import { CocktailIcon } from './icons/CocktailIcon';
import { FoodIcon } from './icons/FoodIcon';

type Category = { slug: string; title: string };

type Props = {
  categories: Category[];
  activeCategorySlug: string;
  onSelect: (slug: string) => void;
};

function CategoryIcon({ slug, isActive }: { slug: string; isActive: boolean }) {
  const iconClass = isActive ? 'text-surface-cream' : 'text-brand-bg';
  const lowerSlug = slug.toLowerCase();

  if (lowerSlug.includes('kitchen') || lowerSlug.includes('food')) {
    return <FoodIcon className={iconClass} />;
  }

  return <CocktailIcon className={iconClass} />;
}

export function CategoryTabs({ categories, activeCategorySlug, onSelect }: Props) {
  return (
    <nav
      aria-label="Menu categories"
      className="flex gap-2 overflow-x-auto scrollbar-hide py-5"
    >
      {categories.map((cat) => {
        const isActive = cat.slug === activeCategorySlug;
        return (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onSelect(cat.slug)}
            aria-pressed={isActive}
            className={[
              'flex shrink-0 items-center justify-center gap-[7px] rounded-full px-[17.6px] py-2',
              'text-[12.8px] font-semibold leading-[1.5] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40',
              isActive
                ? 'bg-text-primary text-surface-cream'
                : 'border-[1.4px] border-brand-border text-brand-bg hover:bg-brand-bg/10',
            ].join(' ')}
          >
            <span>{cat.title}</span>
            <CategoryIcon slug={cat.slug} isActive={isActive} />
          </button>
        );
      })}
    </nav>
  );
}
