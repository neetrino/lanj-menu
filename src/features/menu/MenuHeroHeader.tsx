import type { Locale } from '@/lib/i18n/config';
import { getUiTranslations } from '@/lib/menu/translations';
import { LanguageSwitcher } from './LanguageSwitcher';

type Props = {
  locale: Locale;
};

export function MenuHeroTitle({ locale }: Props) {
  const t = getUiTranslations(locale);

  return (
    <div className="min-w-0 flex-1">
      <h1 className="truncate font-display text-[22px] leading-[1.35] text-text-primary lg:text-[29.6px] lg:leading-[1.15]">
        {t.heading}
      </h1>
    </div>
  );
}

export function MenuHeroHeader({ locale }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <MenuHeroTitle locale={locale} />
      <LanguageSwitcher currentLocale={locale} />
    </div>
  );
}
