'use client';

type Props = {
  subcategories: string[];
  activeSubcategory: string | null;
  onSelect: (subcategory: string | null) => void;
  allLabel: string;
};

const ACTIVE_TAB_CLASS =
  'border border-transparent bg-[#1a0c06] px-[17.6px] py-2 !text-[#fff8f3]';

const INACTIVE_TAB_CLASS =
  'border-[1.427px] border-[#ffa97f] bg-transparent px-[19.027px] py-[9.427px] !text-[#faaa77]';

const TAB_BASE_CLASS = [
  'flex shrink-0 items-center justify-center rounded-full',
  'text-[12.8px] font-semibold leading-[19.2px] whitespace-nowrap transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4673a]/40',
].join(' ');

export function SubcategoryTabs({ subcategories, activeSubcategory, onSelect, allLabel }: Props) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Menu subcategories"
      className="-mt-1 flex gap-2 overflow-x-auto scrollbar-hide pb-2 pt-1 lg:overflow-visible"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={activeSubcategory === null}
        aria-current={activeSubcategory === null ? 'true' : undefined}
        className={[TAB_BASE_CLASS, activeSubcategory === null ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS].join(
          ' ',
        )}
      >
        {allLabel}
      </button>
      {subcategories.map((subcategory) => {
        const isActive = activeSubcategory === subcategory;
        return (
          <button
            key={subcategory}
            type="button"
            onClick={() => onSelect(subcategory)}
            aria-pressed={isActive}
            aria-current={isActive ? 'true' : undefined}
            className={[TAB_BASE_CLASS, isActive ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS].join(' ')}
          >
            {subcategory}
          </button>
        );
      })}
    </nav>
  );
}
