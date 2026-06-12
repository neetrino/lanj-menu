'use client';

import { LanguageSwitcher } from './LanguageSwitcher';
import { SectionNav } from './SectionNav';
import { CategoryNav } from './CategoryNav';
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
    <header className="sticky top-0 z-50 shadow-md" role="banner">
      {/* Main header bar: section nav + language switcher */}
      <div className="bg-brand-header px-4 py-2">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <SectionNav
            sections={sections}
            activeSectionSlug={activeSectionSlug}
            onSelect={onSectionSelect}
          />
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>

      {/* Category strip — only shown when the active section has categories */}
      {categories.length > 0 && (
        <div className="bg-brand-header/90 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <CategoryNav
              categories={categories}
              activeCategorySlug={activeCategorySlug}
              onSelect={onCategorySelect}
            />
          </div>
        </div>
      )}
    </header>
  );
}
