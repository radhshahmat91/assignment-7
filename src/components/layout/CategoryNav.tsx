import { getCategories } from "@/lib/api";
import type { Category } from "@/lib/types";
import { CategoryChips } from "./CategoryChips";

export function CategoryNavSkeleton() {
  return (
    <div className="flex items-center gap-1 overflow-hidden py-2" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="skeleton h-8 w-[72px] shrink-0 rounded-lg" />
      ))}
    </div>
  );
}

/** Fetches the categories on the server; the navbar simply hides the row if the API is down. */
export async function CategoryNav() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    return null;
  }
  if (categories.length === 0) return null;
  return <CategoryChips categories={categories} />;
}
