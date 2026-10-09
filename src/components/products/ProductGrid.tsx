import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/** 1 column on phones, 2 on tablets, 3 on desktops. */
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
