'use client';

type Category = { slug: string; title: string };

type Props = {
  categories: Category[];
  activeCategorySlug: string;
  onSelect: (slug: string) => void;
};

export function CategoryNav({ categories, activeCategorySlug, onSelect }: Props) {
  const handleClick = (slug: string) => {
    onSelect(slug);
    const el = document.getElementById(`category-${slug}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Menu categories"
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2"
    >
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleClick(cat.slug)}
          aria-pressed={cat.slug === activeCategorySlug}
          className={[
            'whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
            cat.slug === activeCategorySlug
              ? 'bg-white text-brand-header border-white font-semibold'
              : 'bg-white/30 text-white border-white/40 hover:bg-white/50 focus-visible:bg-white/50',
          ].join(' ')}
        >
          {cat.title}
        </button>
      ))}
    </nav>
  );
}
