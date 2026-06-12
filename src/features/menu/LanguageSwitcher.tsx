'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

type Props = {
  currentLocale: Locale;
};

const LOCALE_META: Record<Locale, { ariaLabel: string; iconSrc: string }> = {
  hy: { ariaLabel: 'Armenian', iconSrc: '/icons/languages/hy.svg' },
  ru: { ariaLabel: 'Russian', iconSrc: '/icons/languages/ru.svg' },
  en: { ariaLabel: 'English', iconSrc: '/icons/languages/en.svg' },
};

export function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSwitch = (locale: Locale) => {
    const segments = pathname.split('/');
    // segments[1] is the current locale — replace it
    if ((locales as readonly string[]).includes(segments[1])) {
      segments[1] = locale;
      router.push(segments.join('/'));
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <nav aria-label="Language switcher" className="flex gap-1 flex-shrink-0">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleSwitch(locale)}
          aria-pressed={locale === currentLocale}
          aria-label={LOCALE_META[locale].ariaLabel}
          className={[
            'h-9 w-9 rounded-full p-0.5 transition-all border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
            locale === currentLocale
              ? 'bg-white border-white shadow-sm scale-105'
              : 'bg-transparent border-transparent hover:bg-white/20 focus-visible:bg-white/20',
          ].join(' ')}
        >
          <span className="sr-only">{LOCALE_META[locale].ariaLabel}</span>
          <Image
            src={LOCALE_META[locale].iconSrc}
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            className="h-full w-full rounded-full object-cover"
            priority={locale === currentLocale}
          />
        </button>
      ))}
    </nav>
  );
}
