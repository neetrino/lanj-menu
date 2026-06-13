'use client';

import { useState } from 'react';
import { MenuHeader } from './MenuHeader';
import { MenuCategorySection } from './MenuCategorySection';
import { MenuPageContainer } from './MenuPageContainer';
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
      <MenuPageContainer>
        <div className="flex min-h-screen items-center justify-center px-6">
          <EmptyState message={t.noMenu} />
        </div>
      </MenuPageContainer>
    );
  }

  const handleSectionSelect = (slug: string) => {
    setActiveSectionSlug(slug);
    const section = sections.find((s) => s.slug === slug);
    setActiveCategorySlug(section?.categories[0]?.slug ?? '');
  };

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  return (
    <MenuPageContainer>
      <MenuHeader
        locale={locale}
        sections={sections}
        activeSectionSlug={activeSectionSlug}
        activeCategorySlug={activeCategorySlug}
        onSectionSelect={handleSectionSelect}
        onCategorySelect={setActiveCategorySlug}
      />

      <main className="px-5 pb-24 lg:px-8" id="main-content">
        {!activeCategory ? (
          <EmptyState message={t.emptyCategory} />
        ) : (
          <MenuCategorySection
            category={activeCategory}
            sectionLabel={activeSection?.title ?? ''}
            emptyMessage={t.emptyCategory}
          />
        )}
      </main>
    </MenuPageContainer>
  );
}
