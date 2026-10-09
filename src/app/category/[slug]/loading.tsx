import { ProductGridSkeleton } from "@/components/products/Skeletons";

export default function CategoryLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-5">
        <div className="skeleton size-10 rounded-xl" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-7 w-28 rounded" />
          <div className="skeleton h-4 w-52 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="skeleton h-[66px] rounded-2xl" />
        <div className="skeleton h-5 w-44 rounded" />
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}
