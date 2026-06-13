import { MenuHeroHeader } from './MenuHeroHeader';
import { SectionTabs } from './SectionTabs';
import { CategoryTabs } from './CategoryTabs';
import type { Locale } from '@/lib/i18n/config';
import type { MenuSectionPayload } from '@/lib/menu/types';

type Props = {
  locale: Locale;
  sections: MenuSectionPayload[];
  activeSectionSlug: string;
  activeCategorySlug: string;
  onSectionSelect: (slug: string) => void;
  onCategorySelect: (slug: string) => void;
};

export function MenuHeader({
  locale,
  sections,
  activeSectionSlug,
  activeCategorySlug,
  onSectionSelect,
  onCategorySelect,
}: Props) {
  const activeSection = sections.find((s) => s.slug === activeSectionSlug);
  const categories = activeSection?.categories ?? [];

  return (
    <header className="px-6 pt-14" role="banner">
      <MenuHeroHeader locale={locale} />

      {sections.length > 0 && (
        <div className="mt-7">
          <SectionTabs
            sections={sections}
            activeSectionSlug={activeSectionSlug}
            onSelect={onSectionSelect}
          />
        </div>
      )}

      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeCategorySlug={activeCategorySlug}
          onSelect={onCategorySelect}
        />
      )}
    </header>
  );
}
