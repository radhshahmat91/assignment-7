import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs, MarketTable, PriceSummary, ProductHeader } from "@/components/products/ProductDetails";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { getProduct } from "@/lib/api";
import { decodeParam } from "@/lib/params";
import { getSession } from "@/lib/session";

type Props = { params: Promise<{ slug: string }> };

// Static title: a dynamic one would block the loading skeleton on slow connections.
// The product name is applied by <DocumentTitle /> as soon as the content arrives.
export const metadata: Metadata = { title: "পণ্যের বিস্তারিত" };

export default async function ProductPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeParam(rawSlug);

  // Unknown products get the friendly 404 whether or not you are signed in.
  const product = await getProduct(slug);
  if (!product) notFound();

  // Protected route: send visitors to sign in and bring them straight back afterwards.
  const session = await getSession();
  if (!session) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(`/product/${rawSlug}`)}&reason=login-required`);
  }

  return (
    <div className="flex flex-col gap-6">
      <DocumentTitle title={`${product.name} — আজকের দাম`} />
      <Breadcrumbs product={product} />
      <ProductHeader product={product} />
      <div className="flex flex-col gap-6 rounded-2xl border border-base-300 bg-base-100 p-5">
        <PriceSummary product={product} />
        <MarketTable product={product} />
      </div>
    </div>
  );
}
