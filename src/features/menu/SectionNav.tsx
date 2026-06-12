type Section = { slug: string; title: string };

type Props = {
  sections: Section[];
  activeSectionSlug: string;
  onSelect: (slug: string) => void;
};

export function SectionNav({ sections, activeSectionSlug, onSelect }: Props) {
  return (
    <nav
      aria-label="Menu sections"
      className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
    >
      {sections.map((section) => (
        <button
          key={section.slug}
          onClick={() => onSelect(section.slug)}
          aria-pressed={section.slug === activeSectionSlug}
          className={[
            'whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
            section.slug === activeSectionSlug
              ? 'bg-white text-brand-header'
              : 'text-white hover:bg-white/20 focus-visible:bg-white/20',
          ].join(' ')}
        >
          {section.title}
        </button>
      ))}
    </nav>
  );
}
