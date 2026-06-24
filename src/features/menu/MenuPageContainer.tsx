import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';

type Props = {
  children: ReactNode;
};

export function MenuPageContainer({ children }: Props) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-surface-page lg:max-w-none">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
