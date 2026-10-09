import type { Product } from "./types";

export type SortKey = "default" | "price-asc" | "price-desc";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "default", label: "ডিফল্ট" },
  { value: "price-asc", label: "দাম: কম থেকে বেশি" },
  { value: "price-desc", label: "দাম: বেশি থেকে কম" },
];

/**
 * Sorts by the numeric price (prices are parsed from Bengali digits first, so
 * "৯২" < "১,২৯০" is decided by value, not by string order).
 * Products without a price always go last. `default` keeps the API order.
 */
export function sortProducts(products: Product[], key: SortKey): Product[] {
  if (key === "default") return products;
  const direction = key === "price-asc" ? 1 : -1;
  return [...products].sort((a, b) => {
    if (a.price === null && b.price === null) return 0;
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return (a.price - b.price) * direction;
  });
}
