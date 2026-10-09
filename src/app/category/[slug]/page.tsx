import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryProducts } from "@/components/products/CategoryProducts";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategory, getProductsByCategory } from "@/lib/api";
import { toBnDigits } from "@/lib/format";
import { decodeParam } from "@/lib/params";

type Props = { params: Promise<{ slug: string }> };

// A static title keeps the first response chunk (the loading skeleton) from waiting on the API.
export const metadata: Metadata = { title: "ক্যাটাগরি" };

export default async function CategoryPage({ params }: Props) {
  const slug = decodeParam((await params).slug);
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <div className="flex flex-col gap-6">
      <DocumentTitle title={`${category.name} — আজকের দাম`} />
      <header className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-5">
        <span aria-hidden="true" className="text-4xl leading-none">
          {category.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-8">{category.name}</h1>
          <p className="text-sm opacity-70">{toBnDigits(products.length)}টি পণ্যের আজকের দাম ও পরিবর্তন</p>
        </div>
      </header>

      {products.length > 0 ? (
        <CategoryProducts products={products} />
      ) : (
        <EmptyState
          emoji="🧺"
          title="এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই"
          description="কিছুক্ষণ পর আবার দেখুন, অথবা অন্য ক্যাটাগরি বেছে নিন।"
        />
      )}
    </div>
  );
}
