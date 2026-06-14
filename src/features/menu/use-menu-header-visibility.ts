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

type MenuTabsBarState = {
  isTabsVisible: boolean;
  tabsTop: number;
};

/**
 * Standard mobile tab bar behavior: hides on scroll down, shows on scroll up.
 * `tabsTop` keeps the bar below the hero at the page top, then pins to y=0.
 */
export function useMenuTabsBar(heroHeight: number): MenuTabsBarState {
  const [isTabsVisible, setIsTabsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setScrollY(window.scrollY);

    if (prefersReducedMotion()) return;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      setScrollY(currentScrollY);

      if (currentScrollY <= MENU_HEADER_SCROLL_TOP_VISIBLE_PX) {
        setIsTabsVisible(true);
      } else if (delta < -MENU_HEADER_SCROLL_DIRECTION_DELTA_PX) {
        setIsTabsVisible(true);
      } else if (delta > MENU_HEADER_SCROLL_DIRECTION_DELTA_PX) {
        setIsTabsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tabsTop = Math.max(0, heroHeight - scrollY);

  return { isTabsVisible, tabsTop };
}
