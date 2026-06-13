type Section = { slug: string; title: string };

type Props = {
  sections: Section[];
  activeSectionSlug: string;
  onSelect: (slug: string) => void;
};

export function SectionTabs({ sections, activeSectionSlug, onSelect }: Props) {
  return (
    <nav
      aria-label="Menu sections"
      className="flex w-full gap-2 rounded-full bg-brand-bg p-[5.6px]"
    >
      {sections.map((section) => {
        const isActive = section.slug === activeSectionSlug;
        return (
          <button
            key={section.slug}
            type="button"
            onClick={() => onSelect(section.slug)}
            aria-pressed={isActive}
            className={[
              'flex-1 rounded-full px-3 py-[10.4px] text-center text-[13.44px] font-semibold leading-[1.5] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40',
              isActive
                ? 'bg-white text-text-primary shadow-[0_2px_6px_rgba(44,24,16,0.1)]'
                : 'text-white hover:bg-white/10',
            ].join(' ')}
          >
            {section.title}
          </button>
        );
      })}
    </nav>
  );
}
