'use client';

import { useEffect, useRef } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MenuHeroHeader, MenuHeroTitle } from './MenuHeroHeader';
import { SectionTabs } from './SectionTabs';
import { MENU_HEADER_TRANSITION_MS } from './menu-header-scroll.constants';
import { useElementHeight } from './use-element-height';
import { useMenuHeaderVisibility } from './use-menu-header-visibility';
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
  const headerRef = useRef<HTMLElement>(null);
  const headerHeight = useElementHeight(headerRef);
  const isVisible = useMenuHeaderVisibility();

  useEffect(() => {
    if (headerHeight <= 0) return;

    document.documentElement.style.setProperty(
      '--menu-header-height',
      `${headerHeight}px`,
    );

    return () => {
      document.documentElement.style.removeProperty('--menu-header-height');
    };
  }, [headerHeight]);

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);
  const categories = activeSection?.categories ?? [];

  const headerContent = (
    <>
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
    </>
  );

  return (
    <>
      <div
        className={[
          'fixed inset-x-0 top-0 z-50 flex justify-center lg:static',
          'transition-transform ease-out motion-reduce:transition-none',
          isVisible ? 'translate-y-0' : '-translate-y-full lg:translate-y-0',
        ].join(' ')}
        style={{ transitionDuration: `${MENU_HEADER_TRANSITION_MS}ms` }}
      >
        <header
          ref={headerRef}
          className="w-full max-w-[430px] bg-surface-page px-6 pt-14 lg:max-w-none lg:px-10 lg:pt-8"
          role="banner"
        >
          {headerContent}
        </header>
      </div>
    </>
  );
}
