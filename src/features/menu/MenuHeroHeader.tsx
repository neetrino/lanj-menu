import type { Locale } from '@/lib/i18n/config';
import { getUiTranslations } from '@/lib/menu/translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MenuViewToggle } from './MenuViewToggle';
import type { MenuViewMode } from '@/lib/menu/types';

type MenuHeroTitleProps = {
  locale: Locale;
};

type MenuHeroHeaderProps = {
  locale: Locale;
  viewMode: MenuViewMode;
  onViewModeChange: (mode: MenuViewMode) => void;
};

export function MenuHeroTitle({ locale }: MenuHeroTitleProps) {
  const t = getUiTranslations(locale);

  return (
    <div className="min-w-0 flex-1">
      <h1 className="truncate font-display text-[17px] leading-[1.35] text-text-primary sm:text-[19px] lg:text-[29.6px] lg:leading-[1.15]">
        {t.heading}
      </h1>
    </div>
  );
}

export function MenuHeroHeader({
  locale,
  viewMode,
  onViewModeChange,
}: MenuHeroHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <MenuHeroTitle locale={locale} />
      <div className="flex shrink-0 items-center gap-2">
        <MenuViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        <LanguageSwitcher currentLocale={locale} />
      </div>
    </div>
  );
}
