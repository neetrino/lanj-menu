type Props = {
  className?: string;
};

export function ArrowUpRightIcon({ className }: Props) {
  return (
    <svg
      className={className}
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 12.5L12.5 4.5M12.5 4.5H5.5M12.5 4.5V11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
