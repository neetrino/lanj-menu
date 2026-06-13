import type { MenuSectionPayload } from './types';

const STORAGE_KEY = 'lanj-menu-ui-state';

export type MenuUiState = {
  sectionSlug: string;
  categorySlug: string;
  scrollY: number;
  visibleCounts: Record<string, number>;
};

const EMPTY_STATE: MenuUiState = {
  sectionSlug: '',
  categorySlug: '',
  scrollY: 0,
  visibleCounts: {},
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readState(): MenuUiState {
  if (!isBrowser()) return EMPTY_STATE;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;

    const parsed = JSON.parse(raw) as Partial<MenuUiState>;
    return {
      ...EMPTY_STATE,
      ...parsed,
      visibleCounts: parsed.visibleCounts ?? {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(state: MenuUiState): void {
  if (!isBrowser()) return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — safe to ignore
  }
}

export function getMenuUiState(): MenuUiState {
  return readState();
}

/** Merges partial UI state into sessionStorage. */
export function patchMenuUiState(patch: Partial<MenuUiState>): void {
  writeState({ ...readState(), ...patch });
}

/** Saves current window scroll position before locale navigation. */
export function captureMenuScrollPosition(): void {
  if (!isBrowser()) return;
  patchMenuUiState({ scrollY: window.scrollY });
}

/** Persists how many items were loaded for infinite scroll in a category. */
export function setCategoryVisibleCount(categorySlug: string, count: number): void {
  const state = readState();
  writeState({
    ...state,
    visibleCounts: { ...state.visibleCounts, [categorySlug]: count },
  });
}

export function getCategoryVisibleCount(categorySlug: string): number | undefined {
  return readState().visibleCounts[categorySlug];
}

type InitialTabs = {
  sectionSlug: string;
  categorySlug: string;
};

/**
 * Resolves section/category slugs from sessionStorage, falling back to the first
 * available entries when saved slugs are missing or invalid.
 */
export function resolveInitialMenuTabs(sections: MenuSectionPayload[]): InitialTabs {
  const saved = readState();

  const sectionSlug =
    saved.sectionSlug && sections.some((s) => s.slug === saved.sectionSlug)
      ? saved.sectionSlug
      : (sections[0]?.slug ?? '');

  const categories = sections.find((s) => s.slug === sectionSlug)?.categories ?? [];

  const categorySlug =
    saved.categorySlug && categories.some((c) => c.slug === saved.categorySlug)
      ? saved.categorySlug
      : (categories[0]?.slug ?? '');

  return { sectionSlug, categorySlug };
}

/** Restores scroll position saved before locale switch or tab navigation. */
export function restoreMenuScrollPosition(): void {
  if (!isBrowser()) return;

  const { scrollY } = readState();
  if (scrollY <= 0) return;

  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, behavior: 'auto' });
  });
}
