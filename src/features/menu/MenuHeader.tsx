import { CategoryTabs } from './CategoryTabs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MenuHeroHeader, MenuHeroTitle } from './MenuHeroHeader';
import { SectionTabs } from './SectionTabs';
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
    <header className="px-6 pt-14 lg:px-10 lg:pt-8" role="banner">
      <div className="lg:hidden">
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
      </div>

      <div className="hidden lg:flex lg:items-center lg:gap-10 lg:border-b lg:border-black/5 lg:pb-6">
        <MenuHeroTitle locale={locale} />

        {sections.length > 0 && (
          <div className="min-w-0 flex-1">
            <SectionTabs
              sections={sections}
              activeSectionSlug={activeSectionSlug}
              onSelect={onSectionSelect}
            />
          </div>
        )}

        <LanguageSwitcher currentLocale={locale} />
      </div>

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
