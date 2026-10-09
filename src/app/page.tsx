import { Suspense } from "react";
import { Hero } from "@/components/products/Hero";
import { ProductSections } from "@/components/products/ProductSections";
import { HomeSectionsSkeleton } from "@/components/products/Skeletons";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <Hero />
      {/* the hero renders instantly; the price sections stream in behind a skeleton */}
      <Suspense fallback={<HomeSectionsSkeleton />}>
        <ProductSections />
      </Suspense>
    </div>
  );
}
