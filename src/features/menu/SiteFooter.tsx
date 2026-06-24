const NEETRINO_URL = 'https://neetrino.com';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 px-5 py-6 text-center">
      <p className="text-[11px] leading-relaxed text-text-muted">
        Copyright © {year}. All Rights Reserved. Created by{' '}
        <a
          href={NEETRINO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-accent underline-offset-2 hover:underline"
        >
          Neetrino IT Company
        </a>
      </p>
    </footer>
  );
}
