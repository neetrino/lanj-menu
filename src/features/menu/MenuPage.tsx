'use client';

import { useState } from 'react';
import { MenuHeader } from './MenuHeader';
import { MenuCategorySection } from './MenuCategorySection';
import { EmptyState } from './EmptyState';
import { getUiTranslations } from '@/lib/menu/translations';
import type { MenuPayload } from '@/lib/menu/types';
import type { Locale } from '@/lib/i18n/config';

type Props = {
  menuPayload: MenuPayload;
  locale: Locale;
};

export function MenuPage({ menuPayload, locale }: Props) {
  const { sections } = menuPayload;
  const t = getUiTranslations(locale);

  const [activeSectionSlug, setActiveSectionSlug] = useState(sections[0]?.slug ?? '');

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);
  const categories = activeSection?.categories ?? [];

  const [activeCategorySlug, setActiveCategorySlug] = useState(categories[0]?.slug ?? '');

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState message={t.noMenu} />
      </div>
    );
  }

  const handleSectionSelect = (slug: string) => {
    setActiveSectionSlug(slug);
    const section = sections.find((s) => s.slug === slug);
    setActiveCategorySlug(section?.categories[0]?.slug ?? '');
  };

  return (
    <div className="min-h-screen">
      <MenuHeader
        locale={locale}
        sections={sections}
        activeSectionSlug={activeSectionSlug}
        activeCategorySlug={activeCategorySlug}
        onSectionSelect={handleSectionSelect}
        onCategorySelect={setActiveCategorySlug}
      />

      <main className="max-w-3xl mx-auto pb-12" id="main-content">
        {categories.length === 0 ? (
          <EmptyState message={t.emptyCategory} />
        ) : (
          categories.map((category) => (
            <MenuCategorySection
              key={category.slug}
              category={category}
              emptyMessage={t.emptyCategory}
            />
          ))
        )}
      </main>
    </div>
  );
}
