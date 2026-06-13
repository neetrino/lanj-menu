import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Keep in sync with `src/lib/i18n/config.ts` — inlined for Edge runtime compatibility. */
const LOCALES = ['hy', 'ru', 'en'] as const;
const DEFAULT_LOCALE = LOCALES[0];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    const url = request.nextUrl.clone();
    const suffix = pathname === '/' ? '' : pathname;
    url.pathname = `/${DEFAULT_LOCALE}${suffix}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip API routes, Next internals, and static assets
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
