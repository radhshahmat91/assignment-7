#!/usr/bin/env node
/**
 * Sanity-check the live Bazar Dor API against the app's data adapter.
 *
 *   npm run check:api                  # tries both public endpoints
 *   npm run check:api -- <baseUrl>     # or check a specific base URL
 *
 * It prints the raw shape of the first product, how the app understands it, and
 * warns about anything that would render as "—" in the UI.
 */
import {
  extractOne,
  normalizeCategories,
  normalizeProduct,
  normalizeProducts,
} from "../src/lib/normalize.ts";

const DEFAULT_BASES = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];
const bases = process.argv[2]
  ? [process.argv[2].replace(/\/+$/, "")]
  : (process.env.API_BASE_URL?.split(",").map((s) => s.trim()).filter(Boolean) ?? DEFAULT_BASES);

async function get(base, path) {
  const res = await fetch(`${base}${path}`, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(12_000) });
  return { status: res.status, json: res.ok ? await res.json() : null };
}

const short = (value, max = 900) => {
  const text = JSON.stringify(value, null, 2);
  return text.length > max ? `${text.slice(0, max)}\n… (truncated)` : text;
};

let exitCode = 0;
for (const base of bases) {
  console.log(`\n══════ ${base} ══════`);
  try {
    const categoriesRes = await get(base, "/categories");
    const productsRes = await get(base, "/products");
    console.log(`GET /categories → ${categoriesRes.status}    GET /products → ${productsRes.status}`);
    if (!productsRes.json || !categoriesRes.json) {
      console.log("✖ this endpoint did not return data, trying the next one…");
      exitCode = 1;
      continue;
    }

    const categories = normalizeCategories(categoriesRes.json);
    const products = normalizeProducts(productsRes.json, categories);
    console.log(`\nCategories understood: ${categories.length}`);
    console.table(categories);

    console.log("Raw first product from the API:\n" + short(Array.isArray(productsRes.json) ? productsRes.json[0] : productsRes.json));
    console.log(`\nProducts understood: ${products.length}`);
    console.table(
      products.slice(0, 12).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.categorySlug,
        unit: p.unit,
        price: p.price,
        change: `${p.direction} ${p.changePercent.toFixed(1)}%`,
        markets: p.markets.length,
      })),
    );

    const problems = [];
    const count = (label, predicate) => {
      const n = products.filter(predicate).length;
      if (n > 0) problems.push(`${n} product(s) ${label}`);
    };
    count("have no price", (p) => p.price === null);
    count("have no unit", (p) => !p.unit);
    count("could not be matched to a category", (p) => !categories.some((c) => c.slug === p.categorySlug));
    count("have no emoji (fallback 🛒 used)", (p) => p.emoji === "🛒");
    if (products.length === 0) problems.push("no products could be read at all");

    if (products[0]) {
      const detailRes = await get(base, `/products/${encodeURIComponent(products[0].id)}`);
      const detail = detailRes.json ? normalizeProduct(extractOne(detailRes.json), { categories }) : null;
      console.log(`\nGET /products/${products[0].id} → ${detailRes.status}`);
      if (!detail) problems.push("the single-product endpoint returned nothing usable");
      else {
        console.log(`  market rows: ${detail.markets.length}  min/max/avg: ${detail.min} / ${detail.max} / ${detail.avg}`);
        if (detail.markets.length === 0 && products[0].markets.length === 0) problems.push("no market-wise prices were found for the first product");
        console.log("  raw single product:\n" + short(detailRes.json, 700).replace(/^/gm, "  "));
      }
    }

    if (problems.length === 0) {
      console.log("\n✔ Everything the UI needs was found.");
      exitCode = 0;
      break;
    }
    console.log("\n⚠ Things to look at:");
    problems.forEach((line) => console.log("  • " + line));
    console.log("\nIf a field name is not recognised, add it to the candidate lists at the top of src/lib/normalize.ts.");
  } catch (error) {
    console.log(`✖ ${error instanceof Error ? error.message : error}`);
    exitCode = 1;
  }
}
process.exit(exitCode);
