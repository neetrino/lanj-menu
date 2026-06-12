import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Restaurant & Pub Digital Menu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
