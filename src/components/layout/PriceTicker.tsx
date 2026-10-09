import { getProducts } from "@/lib/api";
import { arrowFor, formatNumber, formatPercent, toneClass } from "@/lib/format";
import type { Product } from "@/lib/types";

export function TickerSkeleton() {
  return (
    <div className="h-[37px] border-b border-base-300 bg-base-100" aria-hidden="true">
      <div className="flex gap-4 overflow-hidden px-4 py-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-5 w-52 shrink-0 rounded" />
        ))}
      </div>
    </div>
  );
}

function TickerItem({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap border-r border-base-200 py-2 pl-4 pr-[17px] text-sm">
      <span aria-hidden="true">{product.emoji}</span>
      <span className="font-medium">{product.name}</span>
      <span>
        {formatNumber(product.price as number)} টাকা{product.unit ? `/${product.unit}` : ""}
      </span>
      <span className={`font-semibold ${toneClass(product.direction)}`}>
        {arrowFor(product.direction)} {formatPercent(product.changePercent)}
      </span>
    </div>
  );
}

/** Infinite price strip below the navbar: `emoji name price/unit ▲/▼ %`. Pure CSS animation. */
export async function PriceTicker() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    return null;
  }
  const items = products.filter((p) => p.price !== null);
  if (items.length === 0) return null;

  // Each half of the track must be wider than a big screen so the loop never shows a gap.
  const copies = Math.max(1, Math.ceil(2800 / (items.length * 240)));
  const half = Array.from({ length: copies }, () => items).flat();
  const duration = Math.max(40, Math.round(half.length * 3.4));

  return (
    <section aria-label="আজকের বাজার দর" className="border-b border-base-300 bg-base-100">
      <div className="marquee" style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}>
        <div className="marquee-track">
          <div className="flex">
            {half.map((product, i) => (
              <TickerItem key={`a-${product.id}-${i}`} product={product} />
            ))}
          </div>
          <div className="flex" aria-hidden="true" data-marquee-clone>
            {half.map((product, i) => (
              <TickerItem key={`b-${product.id}-${i}`} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
