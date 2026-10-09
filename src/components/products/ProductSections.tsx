import { getProducts } from "@/lib/api";
import { toBnDigits } from "@/lib/format";
import type { Product } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGrid } from "./ProductGrid";

function Section({
  id,
  titleId,
  icon,
  iconClass,
  title,
  children,
}: {
  id?: string;
  titleId: string;
  icon?: string;
  iconClass?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={titleId} className="flex flex-col gap-3">
      <h2 id={titleId} className="flex items-center gap-2 text-xl font-bold leading-7">
        {icon && (
          <span aria-hidden="true" className={`text-base ${iconClass ?? ""}`}>
            {icon}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}

const byBiggestChange = (a: Product, b: Product) => b.changePercent - a.changePercent;

/** Home page: top-6 risers, top-6 fallers and the full list. */
export async function ProductSections() {
  let products: Product[];
  try {
    products = await getProducts();
  } catch {
    return (
      <EmptyState
        emoji="📡"
        title="দামের তথ্য আনা যায়নি"
        description="সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ দেখে একটু পরে আবার চেষ্টা করুন।"
        hideAction
      >
        <a href="/" className="btn btn-primary mt-2 font-semibold">
          আবার চেষ্টা করুন
        </a>
      </EmptyState>
    );
  }

  if (products.length === 0) {
    return <EmptyState emoji="🧺" title="এখনো কোনো পণ্যের দাম পাওয়া যায়নি" description="কিছুক্ষণ পর আবার দেখুন।" hideAction />;
  }

  const risers = products.filter((p) => p.direction === "up").sort(byBiggestChange).slice(0, 6);
  const fallers = products.filter((p) => p.direction === "down").sort(byBiggestChange).slice(0, 6);

  return (
    <>
      {risers.length > 0 && (
        <Section titleId="risers-title" icon="▲" iconClass="text-error" title="আজ দাম বেড়েছে">
          <ProductGrid products={risers} />
        </Section>
      )}

      {fallers.length > 0 && (
        <Section titleId="fallers-title" icon="▼" iconClass="text-success" title="আজ দাম কমেছে">
          <ProductGrid products={fallers} />
        </Section>
      )}

      <Section id="সব-পণ্য" titleId="all-products-title" title="সব পণ্য">
        <div className="flex flex-col gap-4">
          <p className="text-sm opacity-70">মোট {toBnDigits(products.length)}টি পণ্য দেখানো হচ্ছে</p>
          <ProductGrid products={products} />
        </div>
      </Section>
    </>
  );
}
