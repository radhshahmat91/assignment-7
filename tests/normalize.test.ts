import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatBanglaDate, formatNumber, formatPercent, formatTaka, initialsOf, toBnDigits } from "../src/lib/format.ts";
import { sortProducts } from "../src/lib/sort.ts";
import {
  extractList,
  extractOne,
  mergeProducts,
  normalizeCategories,
  normalizeProduct,
  normalizeProducts,
  toNumber,
} from "../src/lib/normalize.ts";

const categories = normalizeCategories([
  { slug: "chal", name: "চাল", emoji: "🍚" },
  { slug: "sobji", name: "সবজি", emoji: "🥬" },
]);

describe("toNumber", () => {
  it("reads Bengali digits, commas and suffixes", () => {
    assert.equal(toNumber("১,৮৫০ টাকা"), 1850);
    assert.equal(toNumber("৬৩.৫০"), 63.5);
    assert.equal(toNumber("▲ ২.১%"), 2.1);
    assert.equal(toNumber("-3.5"), -3.5);
    assert.equal(toNumber("৳১২০"), 120);
  });
  it("rejects non-numeric input", () => {
    assert.equal(toNumber("—"), null);
    assert.equal(toNumber(undefined), null);
    assert.equal(toNumber({}), null);
    assert.equal(toNumber(Number.NaN), null);
  });
});

describe("normalizeProduct", () => {
  it("handles a flat camelCase product", () => {
    const p = normalizeProduct(
      {
        id: 4,
        name: "বাটাম সাইজ চাল",
        category: "chal",
        emoji: "🍚",
        unit: "কেজি",
        price: 66,
        yesterdayPrice: 64,
        markets: [
          { market: "মাঠ বাজার", division: "ময়মনসিংহ", min: 59, max: 65 },
          { market: "কারওয়ান বাজার", division: "ঢাকা", min: 65, max: 73 },
        ],
      },
      { categories },
    )!;
    assert.equal(p.id, "4");
    assert.equal(p.slug, "4");
    assert.equal(p.categorySlug, "chal");
    assert.equal(p.categoryName, "চাল");
    assert.equal(p.unit, "কেজি");
    assert.equal(p.direction, "up");
    assert.equal(p.changeAmount, 2);
    assert.equal(Math.round(p.changePercent * 10) / 10, 3.1);
    assert.equal(p.min, 59);
    assert.equal(p.max, 73);
    assert.equal(p.avg, 66);
    assert.equal(p.markets[0].avg, 62);
    assert.equal(p.markets.length, 2);
  });

  it("handles snake_case with Bengali-digit strings and a unit prefix", () => {
    const p = normalizeProduct(
      {
        product_id: "7",
        product_name: "আলু",
        category_slug: "sobji",
        unit: "প্রতি কেজি",
        price_today: "৩০ টাকা",
        change_percent: "▼ ৬.২%",
      },
      { categories },
    )!;
    assert.equal(p.name, "আলু");
    assert.equal(p.price, 30);
    assert.equal(p.unit, "কেজি");
    assert.equal(p.direction, "down");
    assert.equal(p.changePercent, 6.2);
    assert.equal(p.emoji, "🥬"); // falls back to the category emoji
  });

  it("handles nested objects and a signed percentage", () => {
    const p = normalizeProduct(
      { id: "x1", name: "ইলিশ মাছ", category: { slug: "mach", name: "মাছ" }, price: { current: "১,৮৫০", change: "+৩.৪%" } },
      { categories },
    )!;
    assert.equal(p.price, 1850);
    assert.equal(p.direction, "up");
    assert.equal(p.changePercent, 3.4);
    assert.equal(p.categoryName, "মাছ");
  });

  it("treats 0% as flat and reads explicit trend words", () => {
    const flat = normalizeProduct({ id: 1, name: "দই", price: 92, changePercent: 0, trend: "up" })!;
    assert.equal(flat.direction, "flat");
    const down = normalizeProduct({ id: 2, name: "পাম তেল", price: 168, changePercent: 2.3, trend: "down" })!;
    assert.equal(down.direction, "down");
    assert.equal(down.changePercent, 2.3);
  });

  it("derives price / min / max / avg from markets when missing", () => {
    const p = normalizeProduct({
      id: 9,
      name: "পেঁয়াজ",
      markets: [
        { name: "A", min: 50, max: 60 },
        { name: "B", min: 52, max: 58 },
      ],
    })!;
    assert.equal(p.min, 50);
    assert.equal(p.max, 60);
    assert.equal(p.avg, 55);
    assert.equal(p.price, 55);
  });

  it("understands numeric trends, boolean flags and ignores a numeric status", () => {
    assert.equal(normalizeProduct({ id: 1, name: "a", price: 10, changePercent: 2, trend: -1 })!.direction, "down");
    assert.equal(normalizeProduct({ id: 2, name: "b", price: 10, changePercent: 2, isDown: true })!.direction, "down");
    assert.equal(normalizeProduct({ id: 3, name: "c", price: 10, changePercent: 2, increased: true })!.direction, "up");
    assert.equal(normalizeProduct({ id: 4, name: "d", price: 10, changePercent: 2, status: 1 })!.direction, "up"); // from the percentage, not from status
  });

  it("finds market rows even under an unfamiliar key", () => {
    const p = normalizeProduct({
      id: 5,
      name: "আলু",
      shopPrices: [
        { shop: "x", marketName: "মাঠ বাজার", division: "ঢাকা", minPrice: "৩০", maxPrice: "৩৬" },
        { shop: "y", marketName: "সদর বাজার", division: "খুলনা", minPrice: "২৮", maxPrice: "৩৪" },
      ],
    })!;
    assert.equal(p.markets.length, 2);
    assert.equal(p.markets[0].market, "মাঠ বাজার");
    assert.equal(p.markets[0].avg, 33);
    assert.equal(p.min, 28);
    assert.equal(p.max, 36);
  });

  it("matches a category given by numeric id", () => {
    const cats = normalizeCategories([{ id: 7, slug: "dal", name: "ডাল" }]);
    const p = normalizeProduct({ id: 1, name: "মসুর ডাল", category: 7, price: 142 }, { categories: cats })!;
    assert.equal(p.categorySlug, "dal");
    assert.equal(p.emoji, "🫘");
  });

  it("returns null when there is nothing to show", () => {
    assert.equal(normalizeProduct({ id: 1 }), null);
    assert.equal(normalizeProduct("nope"), null);
    assert.equal(normalizeProduct(null), null);
  });
});

describe("envelopes", () => {
  it("extracts lists from common shapes", () => {
    assert.equal(extractList([1, 2]).length, 2);
    assert.equal(extractList({ products: [1, 2, 3] }).length, 3);
    assert.equal(extractList({ success: true, data: { items: [1] } }).length, 1);
    assert.equal(extractList({ a: { id: 1 }, b: { id: 2 } }).length, 2);
    assert.deepEqual(extractList({ ok: true }), []);
  });
  it("extracts a single product", () => {
    assert.deepEqual(extractOne({ id: 1 }), { id: 1 });
    assert.deepEqual(extractOne({ data: { id: 2 } }), { id: 2 });
    assert.deepEqual(extractOne([{ id: 3 }]), { id: 3 });
  });
  it("normalizes categories from lists, maps and strings", () => {
    assert.equal(normalizeCategories([{ slug: "dal", name: "ডাল" }])[0].emoji, "🫘");
    assert.equal(normalizeCategories({ tel: { name: "তেল" } })[0].slug, "tel");
    assert.equal(normalizeCategories(["chal", "dal"])[1].name, "ডাল");
  });
  it("normalizeProducts skips broken rows", () => {
    const list = normalizeProducts({ products: [{ id: 1, name: "a", price: 1 }, { id: 2 }, null] });
    assert.equal(list.length, 1);
  });
});

describe("mergeProducts", () => {
  it("prefers the detail endpoint but keeps list data for gaps", () => {
    const base = normalizeProduct({ id: 1, name: "চাল", price: 66, changePercent: 3.1, trend: "up", emoji: "🍚" })!;
    const detail = normalizeProduct({ id: 1, name: "চাল", markets: [{ name: "X", min: 1, max: 3 }] })!;
    const merged = mergeProducts(base, detail)!;
    assert.equal(merged.markets.length, 1);
    assert.equal(merged.direction, "up");
    assert.equal(merged.emoji, "🍚");
  });
});

describe("format", () => {
  it("formats Bengali numbers like the design", () => {
    assert.equal(toBnDigits(2026), "২০২৬");
    assert.equal(formatNumber(148), "১৪৮");
    assert.equal(formatNumber(1850), "১,৮৫০");
    assert.equal(formatNumber(63.5), "৬৩.৫০");
    assert.equal(formatTaka(66), "৬৬ টাকা");
    assert.equal(formatTaka(null), "—");
    assert.equal(formatPercent(2.14), "২.১%");
    assert.equal(formatPercent(0), "০.০%");
  });
  it("formats the Bangla date in Dhaka time", () => {
    assert.equal(formatBanglaDate(new Date("2026-10-06T10:00:00Z")), "মঙ্গলবার, ৬ অক্টোবর, ২০২৬");
    // 19:00 UTC is already the next day in Bangladesh (UTC+6)
    assert.equal(formatBanglaDate(new Date("2026-10-06T19:00:00Z")), "বুধবার, ৭ অক্টোবর, ২০২৬");
  });
  it("builds avatar initials", () => {
    assert.equal(initialsOf("Rezwan Ahmed"), "RA");
    assert.equal(initialsOf("রহিম"), "র");
    assert.equal(initialsOf(""), "?");
  });
});

describe("sortProducts", () => {
  const list = normalizeProducts([
    { id: 1, name: "খাসির মাংস", price: "১,২৯০ টাকা" },
    { id: 2, name: "দই", price: "৯২ টাকা" },
    { id: 3, name: "আলু", price: "৩০" },
    { id: 4, name: "অজানা" },
  ]);
  it("keeps the API order by default", () => {
    assert.deepEqual(sortProducts(list, "default").map((p) => p.id), ["1", "2", "3", "4"]);
  });
  it("sorts Bengali-digit prices by numeric value, low to high", () => {
    // string order would put "১,২৯০" before "৩০" and "৯২"; numeric order must not
    assert.deepEqual(sortProducts(list, "price-asc").map((p) => p.id), ["3", "2", "1", "4"]);
  });
  it("sorts high to low and keeps price-less items last", () => {
    assert.deepEqual(sortProducts(list, "price-desc").map((p) => p.id), ["1", "2", "3", "4"]);
  });
  it("does not mutate the input", () => {
    const before = list.map((p) => p.id).join();
    sortProducts(list, "price-asc");
    assert.equal(list.map((p) => p.id).join(), before);
  });
});
