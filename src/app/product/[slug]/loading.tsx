export default function ProductLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" role="status" aria-label="লোড হচ্ছে">
      <div className="skeleton h-9 w-72 rounded" />
      <div className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 sm:flex-row sm:items-center">
        <div className="skeleton size-20 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-8 w-56 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-72 max-w-full rounded" />
        </div>
        <div className="skeleton h-32 w-full shrink-0 rounded-2xl sm:w-32" />
      </div>
      <div className="flex flex-col gap-6 rounded-2xl border border-base-300 bg-base-100 p-5">
        <div className="skeleton h-7 w-40 rounded" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="skeleton h-[102px] rounded-2xl" />
          <div className="skeleton h-[102px] rounded-2xl" />
          <div className="skeleton h-[102px] rounded-2xl" />
        </div>
        <div className="skeleton h-7 w-52 rounded" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}
