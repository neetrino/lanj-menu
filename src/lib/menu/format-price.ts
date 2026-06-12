/**
 * Formats an integer price (stored in database) for display.
 * Returns empty string when price is null — caller must guard rendering.
 *
 * Examples: 2500 → "2,500 ֏"  |  null → ""
 */
export function formatPrice(price: number | null): string {
  if (price === null) return '';
  return `${price.toLocaleString('en-US')} ֏`;
}
