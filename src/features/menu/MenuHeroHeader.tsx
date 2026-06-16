import Image from 'next/image';
import type { Locale } from '@/lib/i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MenuViewToggle } from './MenuViewToggle';
import type { MenuViewMode } from '@/lib/menu/types';

type MenuHeroHeaderProps = {
  locale: Locale;
  viewMode: MenuViewMode;
  onViewModeChange: (mode: MenuViewMode) => void;
};

export function MenuHeroTitle() {
  return (
    <div className="min-w-0 flex-1">
      <Image
        src="/icon.png"
        alt="Lanj logo"
        width={196}
        height={56}
        className="h-11 w-auto sm:h-12 lg:h-14"
        priority
      />
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
      <MenuHeroTitle />
      <div className="flex shrink-0 items-center gap-2">
        <MenuViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        <LanguageSwitcher currentLocale={locale} />
      </div>
    </div>
  );
}
