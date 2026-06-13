import type { ReactNode } from 'react';
import { MENU_MOBILE_MAX_WIDTH } from './constants';

type Props = {
  children: ReactNode;
};

export function MenuPageContainer({ children }: Props) {
  return (
    <div
      className="mx-auto w-full min-h-screen bg-surface-page"
      style={{ maxWidth: `${MENU_MOBILE_MAX_WIDTH}px` }}
    >
      <div className="mx-auto w-full max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  );
}
