import { isValidLocale, defaultLocale } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { getMenu } from '@/lib/menu/get-menu';
import { MenuPage } from '@/features/menu/MenuPage';

type Params = { locale: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale: raw } = await params;
  const locale: Locale = isValidLocale(raw) ? raw : defaultLocale;
  const menuPayload = await getMenu(locale);

  return <MenuPage menuPayload={menuPayload} locale={locale} />;
}
