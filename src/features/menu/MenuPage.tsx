'use client';

import { useEffect } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuHeader } from './MenuHeader';
import { MenuCategorySection } from './MenuCategorySection';
import { MenuPageContainer } from './MenuPageContainer';
import { SubcategoryTabs } from './SubcategoryTabs';
import { EmptyState } from './EmptyState';
import { filterItemsBySubcategory, listSubcategoryTitles } from './menu-subcategories';
import { getUiTranslations } from '@/lib/menu/translations';
import { buildMenuPath } from '@/lib/menu/menu-routes';
import {
  captureMenuScrollPosition,
  getMenuViewMode,
  patchMenuUiState,
  restoreMenuScrollPosition,
  setMenuViewMode,
} from '@/lib/menu/menu-ui-state';
import type { MenuPayload } from '@/lib/menu/types';
import type { MenuViewMode } from '@/lib/menu/types';
import type { Locale } from '@/lib/i18n/config';

type Props = {
  menuPayload: MenuPayload;
  locale: Locale;
  sectionSlug: string;
  categorySlug: string;
};

export function MenuPage({ menuPayload, locale, sectionSlug, categorySlug }: Props) {
  const router = useRouter();
  const { sections } = menuPayload;
  const t = getUiTranslations(locale);
  const [viewMode, setViewMode] = useState<MenuViewMode>('cards');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  const activeSection = sections.find((section) => section.slug === sectionSlug);
  const categories = activeSection?.categories ?? [];
  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const subcategories = useMemo(
    () => (activeCategory ? listSubcategoryTitles(activeCategory.items) : []),
    [activeCategory],
  );
  const filteredItems = useMemo(
    () =>
      activeCategory
        ? filterItemsBySubcategory(activeCategory.items, activeSubcategory)
        : [],
    [activeCategory, activeSubcategory],
  );

  useEffect(() => {
    restoreMenuScrollPosition();
    const timer = window.setTimeout(restoreMenuScrollPosition, 150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setViewMode(getMenuViewMode());
  }, []);

  useEffect(() => {
    patchMenuUiState({
      sectionSlug,
      categorySlug,
    });
  }, [sectionSlug, categorySlug]);

  useEffect(() => {
    setMenuViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [sectionSlug, categorySlug]);

  useEffect(() => {
    setActiveSubcategory(null);
  }, [sectionSlug, categorySlug]);

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
    const section = sections.find((item) => item.slug === slug);
    const nextCategorySlug = section?.categories[0]?.slug;
    if (!nextCategorySlug) return;

    patchMenuUiState({ scrollY: 0 });
    router.push(buildMenuPath(locale, slug, nextCategorySlug));
  };

  const handleCategorySelect = (slug: string) => {
    if (!sectionSlug) return;

    patchMenuUiState({ scrollY: 0 });
    router.push(buildMenuPath(locale, sectionSlug, slug));
  };

  return (
    <MenuPageContainer>
      <MenuHeader
        locale={locale}
        sections={sections}
        activeSectionSlug={sectionSlug}
        activeCategorySlug={categorySlug}
        onSectionSelect={handleSectionSelect}
        onCategorySelect={handleCategorySelect}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main
        className="px-5 pb-24 lg:px-10"
        id="main-content"
      >
        {!activeCategory ? (
          <EmptyState message={t.emptyCategory} />
        ) : (
          <>
            {activeCategory.slug === 'bar-menu' && subcategories.length > 0 ? (
              <SubcategoryTabs
                subcategories={subcategories}
                activeSubcategory={activeSubcategory}
                onSelect={setActiveSubcategory}
                allLabel={locale === 'hy' ? 'Բոլորը' : locale === 'ru' ? 'Все' : 'All'}
              />
            ) : null}
            <MenuCategorySection
              category={{
                ...activeCategory,
                items: filteredItems,
              }}
              emptyMessage={t.emptyCategory}
              viewMode={viewMode}
            />
          </>
        )}
      </main>
    </MenuPageContainer>
  );
}
