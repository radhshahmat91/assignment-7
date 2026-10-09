export default function ProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy="true" role="status" aria-label="লোড হচ্ছে">
      <div className="flex flex-col gap-2">
        <div className="skeleton h-8 w-44 rounded" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-6">
        <div className="skeleton size-20 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-6 w-40 rounded" />
          <div className="skeleton h-5 w-56 rounded" />
        </div>
        <div className="skeleton h-10 w-28 rounded-lg" />
      </div>
      <div className="skeleton h-56 rounded-2xl" />
    </div>
  );
}
