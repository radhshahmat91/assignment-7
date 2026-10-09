export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-4" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="skeleton size-12 shrink-0 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <div className="skeleton h-5 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/4 rounded" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-6 w-24 rounded" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="পণ্য লোড হচ্ছে">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function SectionSkeleton({ id, count, subtitle = false }: { id?: string; count: number; subtitle?: boolean }) {
  return (
    <section id={id} className="flex flex-col gap-3" aria-busy="true">
      <div className="skeleton h-7 w-44 rounded" />
      {subtitle && <div className="skeleton h-5 w-52 rounded" />}
      <ProductGridSkeleton count={count} />
    </section>
  );
}

/** Shown on Home while the product list is being fetched (hero stays visible). */
export function HomeSectionsSkeleton() {
  return (
    <>
      <SectionSkeleton count={6} />
      <SectionSkeleton count={6} />
      <SectionSkeleton id="সব-পণ্য" count={9} subtitle />
    </>
  );
}
