import { notFound } from 'next/navigation';
import { isValidLocale, defaultLocale, locales } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { getMenu } from '@/lib/menu/get-menu';
import {
  listMenuRouteSlugParams,
  resolveMenuTabsFromRoute,
} from '@/lib/menu/menu-routes';
import { MenuPage } from '@/features/menu/MenuPage';

/** Refresh menu snapshots from DB without a full redeploy. */
export const revalidate = 300;

type Params = {
  locale: string;
  sectionSlug: string;
  categorySlug: string;
};

export async function generateStaticParams() {
  const menuPayload = await getMenu(defaultLocale);

  return locales.flatMap((locale) =>
    listMenuRouteSlugParams(menuPayload.sections).map(({ sectionSlug, categorySlug }) => ({
      locale,
      sectionSlug,
      categorySlug,
    })),
  );
}

export default async function MenuRoutePage({ params }: { params: Promise<Params> }) {
  const { locale: rawLocale, sectionSlug, categorySlug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : defaultLocale;
  const menuPayload = await getMenu(locale);
  const tabs = resolveMenuTabsFromRoute(menuPayload.sections, sectionSlug, categorySlug);

  if (!tabs) {
    notFound();
  }

  return (
    <MenuPage
      menuPayload={menuPayload}
      locale={locale}
      sectionSlug={tabs.sectionSlug}
      categorySlug={tabs.categorySlug}
    />
  );
}
