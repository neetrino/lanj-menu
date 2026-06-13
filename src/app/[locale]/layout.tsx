import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { isValidLocale, defaultLocale, locales } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

type Params = { locale: string };

const TITLE: Record<Locale, string> = {
  hy: 'Ճաշացանկ',
  ru: 'Меню',
  en: 'Menu',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isValidLocale(raw) ? raw : defaultLocale;
  return { title: TITLE[locale] };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return children;
}
