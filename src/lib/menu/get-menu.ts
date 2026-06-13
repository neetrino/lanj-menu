import type { Locale } from '@/lib/i18n/config';
import type { MenuPayload } from './types';
import { getDemoMenu } from './demo-data';

/**
 * Returns the menu payload for the given locale.
 *
 * Priority:
 * 1. MenuSnapshot row in Neon DB (one query, pre-built JSON)
 * 2. Demo/fallback data (when DATABASE_URL is missing or DB is unreachable)
 */
export async function getMenu(locale: Locale): Promise<MenuPayload> {
  if (!process.env.DATABASE_URL) {
    return getDemoMenu(locale);
  }

  try {
    const { prisma } = await import('@/db/client');
    const snapshot = await prisma.menuSnapshot.findUnique({ where: { locale } });
    if (snapshot?.data) {
      return snapshot.data as MenuPayload;
    }
    // No snapshot built yet — fallback to demo
    return getDemoMenu(locale);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getMenu] DB unavailable, using demo data:', err);
    }
    return getDemoMenu(locale);
  }
}
