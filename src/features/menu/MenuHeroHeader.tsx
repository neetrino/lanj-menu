import type { Locale } from '@/lib/i18n/config';
import { getUiTranslations } from '@/lib/menu/translations';
import { LanguageSwitcher } from './LanguageSwitcher';

type Props = {
  locale: Locale;
};

export function MenuHeroTitle({ locale }: Props) {
  const t = getUiTranslations(locale);

  return (
    <div className="min-w-0">
      <p className="text-[11.5px] font-normal uppercase tracking-[0.15em] text-text-muted leading-[1.5]">
        {t.goodDay}
      </p>
      <h1 className="mt-1 font-display text-[29.6px] leading-[1.15] text-text-primary">
        <span className="block">{t.headingLine1}</span>
        <span className="block">{t.headingLine2}</span>
      </h1>
    </div>
  );
}

export function MenuHeroHeader({ locale }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <MenuHeroTitle locale={locale} />
      <LanguageSwitcher currentLocale={locale} />
    </div>
  );
}
