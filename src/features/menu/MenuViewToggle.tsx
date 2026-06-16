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
  icon: () => ReturnType<typeof GridIcon>;
};

const MODE_OPTIONS: ModeOption[] = [
  { value: 'cards', label: 'Cards', icon: GridIcon },
  { value: 'text', label: 'Text', icon: ListIcon },
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
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-brand-bg p-1"
      role="group"
      aria-label="Menu view mode"
    >
      {MODE_OPTIONS.map((option) => {
        const isActive = option.value === viewMode;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            aria-label={option.label}
            className={[
              'inline-flex items-center justify-center rounded-full transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40',
              isActive
                ? 'border border-brand-accent bg-white text-brand-accent'
                : 'border border-transparent text-white hover:bg-white/10',
            ].join(' ')}
            style={{
              width: `${LANGUAGE_BUTTON_SIZE_PX}px`,
              height: `${LANGUAGE_BUTTON_SIZE_PX}px`,
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
