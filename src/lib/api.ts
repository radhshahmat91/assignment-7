import { cache } from "react";
import {
  extractOne,
  mergeProducts,
  normalizeCategories,
  normalizeProduct,
  normalizeProducts,
} from "./normalize";
import type { Category, Product } from "./types";

/** The two public endpoints from the assignment; the second one is the fallback. */
const DEFAULT_BASES = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

function baseUrls(): string[] {
  const fromEnv = (process.env.API_BASE_URL ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_BASES;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * GET `<base><path>`; tries every base URL in order.
 * Resolves to `null` for a 404 and throws `ApiError` when no endpoint answers.
 */
async function request(path: string): Promise<unknown | null> {
  let lastError = "no endpoint configured";
  for (const base of baseUrls()) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        lastError = `${res.status} ${res.statusText} (${base}${path})`;
        continue;
      }
      return await res.json();
    } catch (error) {
      lastError = `${error instanceof Error ? error.message : String(error)} (${base}${path})`;
    }
  }
  throw new ApiError(`Bazar Dor API request failed: ${lastError}`);
}

/** `/categories` — shared by the navbar and every page within one request. */
export const getCategories = cache(async (): Promise<Category[]> => {
  const json = await request("/categories");
  return json ? normalizeCategories(json) : [];
});

/** `/products` — every product, with prices already parsed into numbers. */
export const getProducts = cache(async (): Promise<Product[]> => {
  const [json, categories] = await Promise.all([request("/products"), getCategories().catch(() => [] as Category[])]);
  return json ? normalizeProducts(json, categories) : [];
});

/** Products of a single category. Returns `[]` for an unknown category. */
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const all = await getProducts();
  const fromAll = all.filter((p) => p.categorySlug === slug);
  if (fromAll.length > 0) return fromAll;

  // The list could not be matched to the category - ask the API's own filter.
  try {
    const categories = await getCategories().catch(() => [] as Category[]);
    const json = await request(`/products?category=${encodeURIComponent(slug)}`);
    const filtered = json ? normalizeProducts(json, categories) : [];
    return filtered.length < all.length || all.length === 0 ? filtered : [];
  } catch {
    return [];
  }
}

/** A category from `/categories` (or `null` when the slug does not exist). */
export const getCategory = cache(async (slug: string): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

/** One product by slug or id, enriched with the market table from `/products/:id`. */
export const getProduct = cache(async (param: string): Promise<Product | null> => {
  const [all, categories] = await Promise.all([getProducts(), getCategories().catch(() => [] as Category[])]);
  const fromList = all.find((p) => p.slug === param || p.id === param) ?? null;

  let detail: Product | null = null;
  try {
    const json = await request(`/products/${encodeURIComponent(fromList?.id ?? param)}`);
    detail = json ? normalizeProduct(extractOne(json), { categories }) : null;
  } catch {
    // keep whatever the list endpoint knows
  }
  if (!detail && !fromList) return null;
  return mergeProducts(fromList, detail);
});
