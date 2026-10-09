export type Direction = "up" | "down" | "flat";

/** One row of the "বাজারভিত্তিক আজকের দাম" table. */
export interface MarketPrice {
  market: string;
  division: string;
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface Category {
  /** Optional API id, used to match products that reference their category by id. */
  id?: string;
  slug: string;
  name: string;
  emoji: string;
}

export interface Product {
  /** Identifier used for `/products/:id`. */
  id: string;
  /** What goes in `/product/[slug]` (falls back to the id). */
  slug: string;
  name: string;
  emoji: string;
  /** Unit without the "প্রতি" prefix, e.g. "কেজি". */
  unit: string;
  categorySlug: string;
  categoryName: string;
  /** Today's price in taka. */
  price: number | null;
  previousPrice: number | null;
  /** Absolute change in taka (always >= 0, see `direction`). */
  changeAmount: number | null;
  /** Percentage change (always >= 0, see `direction`). */
  changePercent: number;
  direction: Direction;
  min: number | null;
  max: number | null;
  avg: number | null;
  description: string | null;
  markets: MarketPrice[];
}
