'use client';

import { useRef } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MenuHeroHeader, MenuHeroTitle } from './MenuHeroHeader';
import { SectionTabs } from './SectionTabs';
import { MENU_HEADER_TRANSITION_MS } from './menu-header-scroll.constants';
import { useElementHeight } from './use-element-height';
import { useMenuTabsBar } from './use-menu-header-visibility';
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
  const heroRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const heroHeight = useElementHeight(heroRef);
  const tabsHeight = useElementHeight(tabsRef);
  const { isTabsVisible, tabsTop } = useMenuTabsBar(heroHeight);

  const activeSection = sections.find((s) => s.slug === activeSectionSlug);
  const categories = activeSection?.categories ?? [];

  const sectionTabs =
    sections.length > 0 ? (
      <SectionTabs
        sections={sections}
        activeSectionSlug={activeSectionSlug}
        onSelect={onSectionSelect}
      />
    ) : null;

  const categoryTabs =
    categories.length > 0 ? (
      <CategoryTabs
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        onSelect={onCategorySelect}
      />
    ) : null;

  const hasMobileTabs = sectionTabs !== null || categoryTabs !== null;

  return (
    <>
      <div className="lg:hidden">
        <header
          ref={heroRef}
          className="w-full bg-surface-page px-6 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]"
          role="banner"
        >
          <MenuHeroHeader locale={locale} />
        </header>

        {hasMobileTabs && (
          <div aria-hidden style={{ height: tabsHeight }} />
        )}
      </div>

      {hasMobileTabs && (
        <div
          className={[
            'fixed inset-x-0 z-40 flex justify-center lg:hidden',
            'transition-transform ease-out motion-reduce:transition-none',
            isTabsVisible ? 'translate-y-0' : '-translate-y-full',
          ].join(' ')}
          style={{
            top: tabsTop,
            transitionDuration: `${MENU_HEADER_TRANSITION_MS}ms`,
          }}
        >
          <div
            ref={tabsRef}
            className="w-full max-w-[430px] bg-surface-page px-6"
          >
            {sectionTabs}
            {categoryTabs}
          </div>
        </div>
      )}

      <header
        className="hidden w-full bg-surface-page px-10 pt-8 lg:block"
        role="banner"
      >
        <div className="flex items-center gap-10 border-b border-black/5 pb-6">
          <MenuHeroTitle locale={locale} />

          {sectionTabs && <div className="min-w-0 flex-1">{sectionTabs}</div>}

          <LanguageSwitcher currentLocale={locale} />
        </div>

        {categoryTabs}
      </header>
    </>
  );
}
