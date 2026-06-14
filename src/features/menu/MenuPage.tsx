'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MenuHeader } from './MenuHeader';
import { MenuCategorySection } from './MenuCategorySection';
import { MenuPageContainer } from './MenuPageContainer';
import { EmptyState } from './EmptyState';
import { getUiTranslations } from '@/lib/menu/translations';
import { buildMenuPath } from '@/lib/menu/menu-routes';
import {
  captureMenuScrollPosition,
  patchMenuUiState,
  restoreMenuScrollPosition,
} from '@/lib/menu/menu-ui-state';
import type { MenuPayload } from '@/lib/menu/types';
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

  const activeSection = sections.find((section) => section.slug === sectionSlug);
  const categories = activeSection?.categories ?? [];
  const activeCategory = categories.find((category) => category.slug === categorySlug);

  useEffect(() => {
    restoreMenuScrollPosition();
    const timer = window.setTimeout(restoreMenuScrollPosition, 150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    patchMenuUiState({
      sectionSlug,
      categorySlug,
    });
  }, [sectionSlug, categorySlug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
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
      />

      <main
        className="px-5 pb-24 lg:px-10"
        id="main-content"
      >
        {!activeCategory ? (
          <EmptyState message={t.emptyCategory} />
        ) : (
          <MenuCategorySection
            category={activeCategory}
            emptyMessage={t.emptyCategory}
          />
        )}
      </main>
    </MenuPageContainer>
  );
}
