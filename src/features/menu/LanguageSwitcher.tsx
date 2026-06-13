'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { captureMenuScrollPosition } from '@/lib/menu/menu-ui-state';
import { LANGUAGE_BUTTON_SIZE_PX } from './constants';
import { GlobeIcon } from './icons/GlobeIcon';

type Props = {
  currentLocale: Locale;
};

const LOCALE_LABEL: Record<Locale, string> = {
  hy: 'Հայերեն',
  ru: 'Русский',
  en: 'English',
};

export function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSwitch = (locale: Locale) => {
    captureMenuScrollPosition();

    const segments = pathname.split('/');
    if ((locales as readonly string[]).includes(segments[1])) {
      segments[1] = locale;
      router.push(segments.join('/'));
    } else {
      router.push(`/${locale}`);
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0 pt-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          'flex items-center justify-center rounded-full bg-brand-bg text-text-primary',
          'transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
        ].join(' ')}
        style={{
          width: `${LANGUAGE_BUTTON_SIZE_PX}px`,
          height: `${LANGUAGE_BUTTON_SIZE_PX}px`,
        }}
      >
        <GlobeIcon />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 top-full z-50 mt-2 min-w-[9rem] rounded-2xl border border-black/5 bg-white py-1 shadow-[0_4px_24px_rgba(44,24,16,0.12)]"
        >
          {locales.map((locale) => (
            <li key={locale} role="option" aria-selected={locale === currentLocale}>
              <button
                type="button"
                onClick={() => handleSwitch(locale)}
                className={[
                  'w-full px-4 py-2.5 text-left text-sm font-medium transition-colors',
                  locale === currentLocale
                    ? 'text-brand-accent'
                    : 'text-text-primary hover:bg-brand-bg/20',
                ].join(' ')}
              >
                {LOCALE_LABEL[locale]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
