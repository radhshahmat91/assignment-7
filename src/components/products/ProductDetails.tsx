import Link from "next/link";
import { changeSentence, formatNumber, formatTaka, perUnit } from "@/lib/format";
import type { Product } from "@/lib/types";
import { PriceBadge } from "./PriceBadge";

export function Breadcrumbs({ product }: { product: Product }) {
  return (
    <nav aria-label="breadcrumb" className="breadcrumbs py-2 text-sm">
      <ul>
        <li>
          <Link href="/">হোম</Link>
        </li>
        {product.categorySlug && (
          <li>
            <Link href={`/category/${encodeURIComponent(product.categorySlug)}`}>
              {product.categoryName || "ক্যাটাগরি"}
            </Link>
          </li>
        )}
        <li aria-current="page">{product.name}</li>
      </ul>
    </nav>
  );
}

/** Emoji + title + unit / category tag + change sentence, with today's price tile on the right. */
export function ProductHeader({ product }: { product: Product }) {
  const changeTone =
    product.direction === "up" ? "text-error" : product.direction === "down" ? "text-success" : "";
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 sm:flex-row sm:items-center">
      <span
        aria-hidden="true"
        className="grid size-20 shrink-0 place-items-center rounded-2xl bg-base-200 text-4xl"
      >
        {product.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-bold leading-9">{product.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-70">
          {product.unit && <span>{perUnit(product.unit)}</span>}
          {product.unit && product.categoryName && <span aria-hidden="true">·</span>}
          {product.categoryName && (
            <Link
              href={`/category/${encodeURIComponent(product.categorySlug)}`}
              className="badge badge-sm border-0 bg-base-200 px-2 text-xs font-medium hover:bg-primary/15"
            >
              {product.categoryName}
            </Link>
          )}
        </p>
        <p className="mt-2 text-sm">
          <span className={changeTone}>{changeSentence(product.direction, product.changeAmount)}</span>
        </p>
        {product.description && <p className="mt-1 text-sm opacity-70">{product.description}</p>}
      </div>

      <div className="flex shrink-0 flex-col items-center rounded-2xl bg-base-200 px-5 py-4 text-center sm:min-w-[7.5rem]">
        <span className="text-sm opacity-70">আজকের দাম</span>
        <span className="text-3xl font-bold leading-9">
          {product.price === null ? "—" : formatNumber(product.price)}
        </span>
        <span className="text-sm opacity-70">টাকা{product.unit ? ` / ${product.unit}` : ""}</span>
        <PriceBadge direction={product.direction} percent={product.changePercent} className="mt-1 bg-transparent px-0 text-sm" />
      </div>
    </header>
  );
}

function Stat({ label, value, note, valueClass }: { label: string; value: string; note: string; valueClass: string }) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 px-6 py-4">
      <p className="text-xs">{label}</p>
      <p className={`text-2xl font-bold leading-8 ${valueClass}`}>{value}</p>
      <p className="text-xs">{note}</p>
    </div>
  );
}

/** সর্বনিম্ন / সর্বাধিক / গড় দাম. */
export function PriceSummary({ product }: { product: Product }) {
  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-3">
      <h2 id="summary-title" className="text-lg font-semibold leading-7">
        দামের সারসংক্ষেপ
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="সর্বনিম্ন দাম" value={formatTaka(product.min)} note="সবচেয়ে কম দামের বাজার" valueClass="text-success" />
        <Stat label="সর্বাধিক দাম" value={formatTaka(product.max)} note="সবচেয়ে বেশি দামের বাজার" valueClass="text-error" />
        <Stat
          label="গড় দাম"
          value={formatTaka(product.avg)}
          note={product.unit ? `প্রতি ${product.unit}-এর হিসাবে` : "গড় হিসাব"}
          valueClass="text-primary"
        />
      </div>
    </section>
  );
}

/** বাজারভিত্তিক আজকের দাম — zebra table, scrolls sideways on small screens. */
export function MarketTable({ product }: { product: Product }) {
  return (
    <section aria-labelledby="markets-title" className="flex flex-col gap-3">
      <h2 id="markets-title" className="text-lg font-semibold leading-7">
        বাজারভিত্তিক আজকের দাম
      </h2>

      {product.markets.length === 0 ? (
        <p className="rounded-2xl border border-base-300 bg-base-100 px-5 py-8 text-center text-sm opacity-70">
          এই পণ্যের বাজারভিত্তিক দামের তথ্য এখনো পাওয়া যায়নি।
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
          <table className="table-zebra table min-w-[40rem]">
            <thead>
              <tr>
                <th className="font-bold">বাজার</th>
                <th className="font-bold">বিভাগ</th>
                <th className="text-right font-bold">সর্বনিম্ন</th>
                <th className="text-right font-bold">সর্বাধিক</th>
                <th className="text-right font-bold">গড়</th>
              </tr>
            </thead>
            <tbody>
              {product.markets.map((market, index) => (
                <tr key={`${market.market}-${index}`}>
                  <td className="font-medium">{market.market}</td>
                  <td>{market.division || "—"}</td>
                  <td className="text-right">{formatTaka(market.min)}</td>
                  <td className="text-right">{formatTaka(market.max)}</td>
                  <td className="text-right font-semibold">{formatTaka(market.avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
