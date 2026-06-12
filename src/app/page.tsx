import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

/**
 * Belt-and-suspenders redirect for the bare root path `/`.
 * Middleware handles the common case; this catches anything that slips through.
 */
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
