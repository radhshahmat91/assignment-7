import Link from "next/link";
import { Suspense } from "react";
import { formatBanglaDate } from "@/lib/format";
import { TodayDate } from "@/components/ui/TodayDate";
import { AuthMenu } from "./AuthMenu";
import { CategoryNav, CategoryNavSkeleton } from "./CategoryNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="বাজার দর — হোম পেজ">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-lg text-primary-content"
          >
            🛒
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-xl font-bold leading-[1.4] tracking-tight">বাজার দর</span>
            <TodayDate initial={formatBanglaDate()} className="truncate text-xs leading-4" />
          </span>
        </Link>
        <div className="flex-1" />
        <AuthMenu />
      </div>

      <div className="border-t border-base-200 bg-base-100">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Suspense fallback={<CategoryNavSkeleton />}>
            <CategoryNav />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
