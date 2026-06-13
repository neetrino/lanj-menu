import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

/**
 * Redirect bare root `/` to the default locale menu page.
 */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
