'use client';

import { CategoryTabIcon } from './CategoryTabIcon';

type Category = { slug: string; title: string };

type Props = {
  categories: Category[];
  activeCategorySlug: string;
  onSelect: (slug: string) => void;
};

/** Figma node 1:28 — active category tab */
const ACTIVE_TAB_CLASS =
  'border border-transparent bg-[#1a0c06] px-[17.6px] py-2 !text-[#fff8f3]';

/** Figma node 1:30 — inactive category tab */
const INACTIVE_TAB_CLASS =
  'border-[1.427px] border-[#ffa97f] bg-transparent px-[19.027px] py-[9.427px] !text-[#faaa77]';

const TAB_BASE_CLASS = [
  'flex shrink-0 items-center justify-center gap-[7px] rounded-full',
  'text-[12.8px] font-semibold leading-[19.2px] whitespace-nowrap transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4673a]/40',
].join(' ');

export function CategoryTabs({ categories, activeCategorySlug, onSelect }: Props) {
  const shouldCenterOnMobile = categories.length <= 2;

  return (
    <nav
      aria-label="Menu categories"
      className={[
        'flex gap-2 overflow-x-auto scrollbar-hide py-3 lg:overflow-visible lg:py-5',
        shouldCenterOnMobile ? 'justify-center' : '',
      ].join(' ')}
    >
      {categories.map((cat) => {
        const isActive = cat.slug === activeCategorySlug;
        return (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onSelect(cat.slug)}
            aria-pressed={isActive}
            aria-current={isActive ? 'true' : undefined}
            className={[TAB_BASE_CLASS, isActive ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS].join(' ')}
          >
            <span>{cat.title}</span>
            <CategoryTabIcon slug={cat.slug} isActive={isActive} />
          </button>
        );
      })}
    </nav>
  );
}
