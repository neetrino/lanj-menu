type Props = {
  price: string;
};

/**
 * Price label on menu cards — Figma node 1:86 (`#e8a987`).
 */
export function MenuItemPrice({ price }: Props) {
  return (
    <p
      className="whitespace-nowrap font-sans text-[16px] font-bold leading-[24px] !text-[#e8a987]"
      aria-label={`Price: ${price}`}
    >
      {price}
    </p>
  );
}
