type Props = {
  className?: string;
};

export function CocktailIcon({ className }: Props) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2.5h10L7.5 8v3.5M4.5 11.5h5.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 5.5c.5-1 1.5-1.5 2-1.5s1.5.5 2 1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
