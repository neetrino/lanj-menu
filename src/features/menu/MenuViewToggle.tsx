'use client';

import { LANGUAGE_BUTTON_SIZE_PX } from './constants';
import type { MenuViewMode } from '@/lib/menu/types';

type Props = {
  viewMode: MenuViewMode;
  onChange: (mode: MenuViewMode) => void;
};

type ModeOption = {
  value: MenuViewMode;
  label: string;
};

const MODE_OPTIONS: ModeOption[] = [
  { value: 'cards', label: 'Cards' },
  { value: 'text', label: 'Text' },
];

function ListIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.2" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" />
      <rect x="14" y="14" width="7" height="7" rx="1.2" />
    </svg>
  );
}

export function MenuViewToggle({ viewMode, onChange }: Props) {
  const nextMode: MenuViewMode = viewMode === 'cards' ? 'text' : 'cards';
  const mobileAriaLabel =
    viewMode === 'cards' ? 'Switch to text view' : 'Switch to card view';

  return (
    <>
      <button
        type="button"
        onClick={() => onChange(nextMode)}
        aria-label={mobileAriaLabel}
        className={[
          'inline-flex items-center justify-center rounded-full bg-brand-bg text-text-primary lg:hidden',
          'transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
        ].join(' ')}
        style={{
          width: `${LANGUAGE_BUTTON_SIZE_PX}px`,
          height: `${LANGUAGE_BUTTON_SIZE_PX}px`,
        }}
      >
        {viewMode === 'cards' ? <ListIcon /> : <GridIcon />}
      </button>

      <div
        className="hidden rounded-full bg-brand-bg p-1 lg:inline-flex"
        role="group"
        aria-label="Menu view mode"
      >
        {MODE_OPTIONS.map((option) => {
          const isActive = option.value === viewMode;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40',
                isActive ? 'bg-white text-text-primary' : 'text-white hover:bg-white/10',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
