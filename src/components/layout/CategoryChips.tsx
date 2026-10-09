"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/types";

/** Second navbar row: one chip per category, the current one is highlighted. */
export function CategoryChips({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="পণ্যের ক্যাটাগরি">
      <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto py-2">
        {categories.map((category) => {
          const href = `/category/${encodeURIComponent(category.slug)}`;
          const active = pathname === href || pathname === `/category/${category.slug}`;
          return (
            <li key={category.slug} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`btn btn-sm gap-1.5 px-3 text-xs font-semibold ${active ? "btn-primary" : "btn-ghost"}`}
              >
                <span aria-hidden="true">{category.emoji}</span>
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
