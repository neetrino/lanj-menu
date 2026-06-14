import { redirect } from 'next/navigation';
import { isValidLocale, defaultLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { getMenu } from '@/lib/menu/get-menu';
import { buildMenuPath } from '@/lib/menu/menu-routes';
import { resolveDefaultMenuTabs } from '@/lib/menu/menu-ui-state';
import { MenuPage } from '@/features/menu/MenuPage';

/** Refresh menu snapshots from DB without a full redeploy. */
export const revalidate = 300;

type Params = { locale: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale: raw } = await params;
  const locale: Locale = isValidLocale(raw) ? raw : defaultLocale;
  const menuPayload = await getMenu(locale);
  const defaults = resolveDefaultMenuTabs(menuPayload.sections);

  if (defaults.sectionSlug && defaults.categorySlug) {
    redirect(buildMenuPath(locale, defaults.sectionSlug, defaults.categorySlug));
  }

  return (
    <MenuPage
      menuPayload={menuPayload}
      locale={locale}
      sectionSlug=""
      categorySlug=""
    />
  );
}
