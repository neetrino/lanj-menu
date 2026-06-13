'use client';

import { useEffect, useState } from 'react';
import { MenuHeader } from './MenuHeader';
import { MenuCategorySection } from './MenuCategorySection';
import { MenuPageContainer } from './MenuPageContainer';
import { EmptyState } from './EmptyState';
import { getUiTranslations } from '@/lib/menu/translations';
import {
  captureMenuScrollPosition,
  patchMenuUiState,
  resolveInitialMenuTabs,
  restoreMenuScrollPosition,
} from '@/lib/menu/menu-ui-state';
import type { MenuPayload } from '@/lib/menu/types';
import type { Locale } from '@/lib/i18n/config';

type Props = {
  menuPayload: MenuPayload;
  locale: Locale;
};

export function MenuPage({ menuPayload, locale }: Props) {
  const { sections } = menuPayload;
  const t = getUiTranslations(locale);

  const [activeSectionSlug, setActiveSectionSlug] = useState(
    () => resolveInitialMenuTabs(sections).sectionSlug,
  );
  const [activeCategorySlug, setActiveCategorySlug] = useState(
    () => resolveInitialMenuTabs(sections).categorySlug,
  );

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);
  const categories = activeSection?.categories ?? [];
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  useEffect(() => {
    restoreMenuScrollPosition();
    const timer = window.setTimeout(restoreMenuScrollPosition, 150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    patchMenuUiState({
      sectionSlug: activeSectionSlug,
      categorySlug: activeCategorySlug,
    });
  }, [activeSectionSlug, activeCategorySlug]);

  useEffect(() => {
    const onScroll = () => captureMenuScrollPosition();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    window.scrollTo({ top: 0, behavior: 'auto' });
    patchMenuUiState({ scrollY: 0 });
  };

  const handleCategorySelect = (slug: string) => {
    setActiveCategorySlug(slug);
    window.scrollTo({ top: 0, behavior: 'auto' });
    patchMenuUiState({ scrollY: 0 });
  };

  return (
    <MenuPageContainer>
      <MenuHeader
        locale={locale}
        sections={sections}
        activeSectionSlug={activeSectionSlug}
        activeCategorySlug={activeCategorySlug}
        onSectionSelect={handleSectionSelect}
        onCategorySelect={handleCategorySelect}
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
