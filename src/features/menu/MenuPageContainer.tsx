import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function MenuPageContainer({ children }: Props) {
  return (
    <div className="mx-auto w-full min-h-screen max-w-[430px] bg-surface-page lg:max-w-none">
      {children}
    </div>
  );
}
