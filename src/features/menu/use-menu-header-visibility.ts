'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MENU_HEADER_SCROLL_DIRECTION_DELTA_PX,
  MENU_HEADER_SCROLL_TOP_VISIBLE_PX,
} from './menu-header-scroll.constants';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns whether the mobile menu header should be visible.
 * Hides on scroll down, reveals on scroll up or near the top of the page.
 */
export function useMenuHeaderVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= MENU_HEADER_SCROLL_TOP_VISIBLE_PX) {
        setIsVisible(true);
      } else if (delta < -MENU_HEADER_SCROLL_DIRECTION_DELTA_PX) {
        setIsVisible(true);
      } else if (delta > MENU_HEADER_SCROLL_DIRECTION_DELTA_PX) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return isVisible;
}
