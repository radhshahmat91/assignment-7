import Link from "next/link";
import { formatTaka, perUnit } from "@/lib/format";
import type { Product } from "@/lib/types";
import { PriceBadge } from "./PriceBadge";

/** The card shared by Home and Category pages. The whole card links to the product page. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${encodeURIComponent(product.slug)}`}
      className="group block rounded-2xl border border-base-300 bg-base-100 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <article className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-base-200 text-2xl"
          >
            {product.emoji}
          </span>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-semibold leading-6">{product.name}</h3>
            {product.unit && <p className="text-xs leading-4">{perUnit(product.unit)}</p>}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs leading-4">আজকের দাম</p>
            <p className="text-xl font-bold leading-7">{formatTaka(product.price)}</p>
          </div>
          <PriceBadge direction={product.direction} percent={product.changePercent} />
        </div>
      </article>
    </Link>
  );
}
