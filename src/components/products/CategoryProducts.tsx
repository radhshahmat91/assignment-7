"use client";

import { useId, useMemo, useState } from "react";
import { toBnDigits } from "@/lib/format";
import { SORT_OPTIONS, sortProducts, type SortKey } from "@/lib/sort";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";

/** Sort bar + count + card grid for a category. Sorting happens in the browser. */
export function CategoryProducts({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortKey>("default");
  const selectId = useId();
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
        <label htmlFor={selectId} className="text-sm opacity-70">
          সাজান
        </label>
        <select
          id={selectId}
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="select select-sm w-auto min-w-[8.5rem] border-base-300 bg-base-100 text-xs"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm opacity-70" aria-live="polite">
        মোট {toBnDigits(sorted.length)}টি পণ্য দেখানো হচ্ছে
      </p>

      <ProductGrid products={sorted} />
    </div>
  );
}
