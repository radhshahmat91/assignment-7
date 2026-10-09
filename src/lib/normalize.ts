/**
 * Schema-tolerant adapters for the Bazar Dor price API.
 *
 * The API returns Bangla text and (sometimes) Bengali-digit strings such as
 * "১,৮৫০ টাকা" or "▲ ২.১%". These helpers turn whatever comes back into the
 * strictly-typed `Product` / `Category` shapes used by the UI, so sorting,
 * min/max/average and the rise/fall sections always work on real numbers.
 *
 * Only erasable TypeScript syntax is used on purpose, so Node can run this file
 * directly (see scripts/check-api.mjs and tests/).
 */
import type { Category, Direction, MarketPrice, Product } from "./types";

type Obj = Record<string, unknown>;
interface Entry {
  depth: number;
  key: string;
  value: unknown;
}

export interface NormalizeContext {
  categories?: Category[];
  /** position in the list, used when the API gives no id */
  index?: number;
}

/* ── known names ───────────────────────────────────────────── */

export const EMOJI_BY_CATEGORY_NAME: Record<string, string> = {
  চাল: "🍚",
  ডাল: "🫘",
  তেল: "🛢️",
  সবজি: "🥬",
  মাছ: "🐟",
  মাংস: "🍗",
  "ডিম-দুধ": "🥛",
  মসলা: "🌶️",
};

const KNOWN_CATEGORY_NAMES: Record<string, string> = {
  chal: "চাল",
  rice: "চাল",
  dal: "ডাল",
  pulses: "ডাল",
  tel: "তেল",
  oil: "তেল",
  sobji: "সবজি",
  shobji: "সবজি",
  sabji: "সবজি",
  vegetables: "সবজি",
  mach: "মাছ",
  fish: "মাছ",
  mangsho: "মাংস",
  meat: "মাংস",
  "dim-dudh": "ডিম-দুধ",
  dimdudh: "ডিম-দুধ",
  "egg-milk": "ডিম-দুধ",
  moshla: "মসলা",
  masala: "মসলা",
  spices: "মসলা",
};

const UNIT_ALIASES: Record<string, string> = {
  kg: "কেজি",
  kgs: "কেজি",
  kilogram: "কেজি",
  kilograms: "কেজি",
  l: "লিটার",
  lt: "লিটার",
  ltr: "লিটার",
  liter: "লিটার",
  litre: "লিটার",
  dozen: "ডজন",
  doz: "ডজন",
  dz: "ডজন",
  piece: "পিস",
  pieces: "পিস",
  pcs: "পিস",
  pc: "পিস",
  each: "পিস",
  g: "গ্রাম",
  gm: "গ্রাম",
  gram: "গ্রাম",
  hali: "হালি",
};

/* ── candidate field names (first match wins) ─────────────── */

const ID_KEYS = ["id", "_id", "productId", "product_id", "pid"];
const SLUG_KEYS = ["slug", "handle", "permalink"];
const NAME_KEYS = [
  "name",
  "nameBn",
  "name_bn",
  "bnName",
  "banglaName",
  "nameBangla",
  "productName",
  "product_name",
  "title",
  "label",
];
const UNIT_KEYS = ["unit", "unitName", "unit_name", "unitLabel", "unit_label", "perUnit", "per_unit", "uom", "measure"];
const CATEGORY_KEYS = ["category", "categorySlug", "category_slug", "categoryId", "category_id", "cat", "group", "type"];
const CATEGORY_NAME_KEYS = ["categoryName", "category_name", "categoryBn", "category_bn", "categoryLabel"];
const EMOJI_KEYS = ["emoji", "icon", "symbol", "image", "thumbnail", "thumb", "img"];
const PRICE_KEYS = [
  "price",
  "currentPrice",
  "current_price",
  "todayPrice",
  "today_price",
  "priceToday",
  "price_today",
  "todaysPrice",
  "current",
  "today",
  "retailPrice",
  "retail_price",
  "rate",
  "avgPrice",
  "avg_price",
  "averagePrice",
  "average_price",
  "avg",
  "average",
];
const PREV_KEYS = [
  "previousPrice",
  "previous_price",
  "prevPrice",
  "prev_price",
  "yesterdayPrice",
  "yesterday_price",
  "priceYesterday",
  "price_yesterday",
  "oldPrice",
  "old_price",
  "lastPrice",
  "last_price",
  "previous",
  "yesterday",
];
const PCT_KEYS = [
  "changePercent",
  "change_percent",
  "changePct",
  "change_pct",
  "changePercentage",
  "change_percentage",
  "percentChange",
  "percent_change",
  "percentageChange",
  "percentage_change",
  "pctChange",
  "pct_change",
  "changeRate",
  "change_rate",
  "percent",
  "percentage",
  "pct",
];
const AMOUNT_KEYS = [
  "changeAmount",
  "change_amount",
  "priceChange",
  "price_change",
  "changeValue",
  "change_value",
  "diff",
  "difference",
  "delta",
];
const DIRECTION_KEYS = [
  "trend",
  "direction",
  "changeType",
  "change_type",
  "changeDirection",
  "change_direction",
  "priceTrend",
  "price_trend",
  "movement",
  "arrow",
];
/** Too generic to trust when numeric (a `status: 1` is not "up"), so strings only. */
const WEAK_DIRECTION_KEYS = ["status", "state"];
const UP_FLAGS = ["isUp", "is_up", "up", "increased", "isIncreased", "is_increased", "rising", "isRising"];
const DOWN_FLAGS = ["isDown", "is_down", "down", "decreased", "isDecreased", "is_decreased", "falling", "isFalling"];
const MIN_KEYS = ["minPrice", "min_price", "min", "lowestPrice", "lowest_price", "lowest", "lowPrice", "low", "minimum"];
const MAX_KEYS = ["maxPrice", "max_price", "max", "highestPrice", "highest_price", "highest", "highPrice", "high", "maximum"];
const AVG_KEYS = ["avgPrice", "avg_price", "avg", "averagePrice", "average_price", "average", "mean"];
const DESCRIPTION_KEYS = ["description", "summary", "subtitle", "desc", "note"];
const MARKET_LIST_KEYS = [
  "markets",
  "priceList",
  "price_list",
  "byMarket",
  "by_market",
  "marketData",
  "market_data",
  "marketsData",
  "marketPrices",
  "market_prices",
  "marketWise",
  "market_wise",
  "bazars",
  "bazaars",
  "marketList",
  "market_list",
  "locations",
  "prices",
  "details",
  "data",
];
const MARKET_NAME_KEYS = ["market", "marketName", "market_name", "bazar", "bazarName", "bazar_name", "name", "title"];
const DIVISION_KEYS = ["division", "region", "area", "district", "city", "location"];

/* ── low-level helpers ─────────────────────────────────────── */

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

const normKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]/g, "");

function entriesOf(obj: Obj, maxDepth = 2): Entry[] {
  const out: Entry[] = [];
  const walk = (o: Obj, depth: number) => {
    for (const [k, v] of Object.entries(o)) out.push({ depth, key: normKey(k), value: v });
    if (depth < maxDepth) {
      for (const v of Object.values(o)) if (isObj(v)) walk(v, depth + 1);
    }
  };
  walk(obj, 0);
  return out.sort((a, b) => a.depth - b.depth);
}

function pickWith<T>(entries: Entry[], names: string[], convert: (v: unknown) => T | null, maxDepth = 2): T | null {
  for (const name of names) {
    const key = normKey(name);
    for (const entry of entries) {
      if (entry.depth > maxDepth || entry.key !== key) continue;
      const out = convert(entry.value);
      if (out !== null) return out;
    }
  }
  return null;
}

/** "১,৮৫০ টাকা" | "▲ ২.১%" | "-3.5" | 12 → number */
export function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const ascii = v
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/[\u2212\u2013\u2014]/g, "-")
    .replace(/,/g, "");
  const match = ascii.match(/-?\d+(?:\.\d+)?|-?\.\d+/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isFinite(n) ? n : null;
}

function toText(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim();
    return t ? t : null;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (isObj(v)) {
    for (const k of ["bn", "bangla", "name", "title", "label", "en", "english", "value"]) {
      const inner = v[k];
      if (typeof inner === "string" && inner.trim()) return inner.trim();
    }
  }
  return null;
}

function toNumeric(v: unknown): string | number | null {
  return (typeof v === "string" || typeof v === "number") && toNumber(v) !== null ? v : null;
}

function asEmoji(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t && t.length <= 16 && /\p{Extended_Pictographic}/u.test(t) ? t : null;
}

/** Like `toDirection`, but also understands 1 / -1 / 0. */
function toDirectionLoose(v: unknown): Direction | null {
  if (typeof v === "number" && Number.isFinite(v)) return v > 0 ? "up" : v < 0 ? "down" : "flat";
  return toDirection(v);
}

function toDirection(v: unknown): Direction | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  if (!s) return null;
  if (/[▲↑⬆]|বেড়|বৃদ্ধি|ঊর্ধ্ব|উর্ধ্ব|\b(up|rise|rises|rose|raised|increase|increased|higher|gain|positive|bullish)\b/.test(s)) return "up";
  if (/[▼↓⬇]|কম|হ্রাস|নিম্ন|\b(down|fall|falls|fell|drop|dropped|decrease|decreased|lower|loss|negative|bearish)\b/.test(s)) return "down";
  if (/অপরিবর্তি|স্থির|\b(flat|same|stable|steady|unchanged|neutral|equal|none)\b|^[—–=-]$/.test(s)) return "flat";
  return null;
}

/** Direction hinted by the sign or arrow of a raw change value. */
function directionFromSigned(raw: unknown, n: number): Direction | null {
  if (typeof raw === "string") {
    const s = raw.trim();
    if (/^[-\u2212\u2013]/.test(s)) return "down";
    if (/^\+/.test(s)) return "up";
    const fromWords = toDirection(s);
    if (fromWords) return fromWords;
  }
  return n > 0 ? "up" : n < 0 ? "down" : "flat";
}

function cleanUnit(raw: string | null): string {
  if (!raw) return "";
  let unit = raw.trim().replace(/^প্রতি\s*/u, "").replace(/^per\s+/i, "").replace(/^\/\s*/, "").trim();
  const alias = UNIT_ALIASES[unit.toLowerCase()];
  if (alias) unit = alias;
  return unit;
}

const same = (a: string, b: string) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ── list / envelope helpers ───────────────────────────────── */

const LIST_KEYS = ["products", "data", "items", "results", "records", "categories"];

/** Accepts `[...]`, `{ products: [...] }`, `{ data: { items: [...] } }`, `{ "1": {...}, "2": {...} }`. */
export function extractList(json: unknown, keys: string[] = LIST_KEYS, allowMap = true): unknown[] {
  if (Array.isArray(json)) return json;
  if (!isObj(json)) return [];
  for (const key of keys) {
    const value = json[key];
    if (Array.isArray(value)) return value;
    if (isObj(value)) {
      const inner = extractList(value, keys, allowMap);
      if (inner.length) return inner;
    }
  }
  if (!allowMap) return [];
  const values = Object.values(json);
  if (values.length > 0 && values.every(isObj)) return values;
  return [];
}

/** Accepts `{...}`, `{ product: {...} }`, `{ data: {...} }` or `[{...}]`. */
export function extractOne(json: unknown): unknown {
  if (Array.isArray(json)) return json[0] ?? null;
  if (isObj(json)) {
    for (const key of ["product", "data", "item", "result"]) {
      const inner = json[key];
      if (isObj(inner)) return inner;
      if (Array.isArray(inner)) return inner[0] ?? null;
    }
  }
  return json;
}

/* ── categories ────────────────────────────────────────────── */

export function normalizeCategory(raw: unknown, fallbackSlug?: string): Category | null {
  let slug = fallbackSlug ?? "";
  let name = "";
  let id: string | undefined;
  let emoji: string | null = null;
  if (typeof raw === "string") {
    slug = raw.trim();
  } else if (isObj(raw)) {
    const e = entriesOf(raw, 1);
    id = pickWith(e, ["id", "_id", "categoryId", "category_id"], toText, 0) ?? undefined;
    slug = pickWith(e, ["slug", "key", "code", "value", "categorySlug", "id"], toText, 0) ?? slug;
    name = pickWith(e, ["name", "nameBn", "name_bn", "bnName", "title", "label"], toText, 0) ?? "";
    emoji = pickWith(e, EMOJI_KEYS, asEmoji, 1);
  } else {
    return null;
  }
  if (!slug && !name) return null;
  if (!slug) slug = name;
  if (!name) name = KNOWN_CATEGORY_NAMES[slug.toLowerCase()] ?? slug;
  return { ...(id ? { id } : {}), slug, name, emoji: emoji ?? EMOJI_BY_CATEGORY_NAME[name] ?? "🛒" };
}

export function normalizeCategories(json: unknown): Category[] {
  let pairs: Array<[string | undefined, unknown]> = extractList(
    json,
    ["categories", "data", "items", "results"],
    false,
  ).map((item) => [undefined, item]);
  if (pairs.length === 0 && isObj(json)) {
    const map = isObj(json.categories) ? json.categories : json;
    pairs = Object.entries(map).map(([key, value]) => [key, value]);
  }
  const out: Category[] = [];
  for (const [key, item] of pairs) {
    const category = normalizeCategory(item, key);
    if (category && !out.some((c) => c.slug === category.slug)) out.push(category);
  }
  return out;
}

/* ── markets ───────────────────────────────────────────────── */

function normalizeMarket(raw: unknown): MarketPrice | null {
  if (!isObj(raw)) return null;
  const e = entriesOf(raw, 2);
  const market = pickWith(e, MARKET_NAME_KEYS, toText) ?? "";
  const division = pickWith(e, DIVISION_KEYS, toText) ?? "";
  let min = pickWith(e, MIN_KEYS, toNumber);
  let max = pickWith(e, MAX_KEYS, toNumber);
  let avg = pickWith(e, AVG_KEYS, toNumber);
  if (min === null && max === null) {
    const single = pickWith(e, ["price", "rate", "amount"], toNumber);
    if (single !== null) {
      min = single;
      max = single;
    }
  }
  if (avg === null && min !== null && max !== null) avg = round2((min + max) / 2);
  if (!market && min === null && max === null && avg === null) return null;
  return { market: market || "—", division, min, max, avg };
}

/* ── products ──────────────────────────────────────────────── */

export function normalizeProduct(input: unknown, ctx: NormalizeContext = {}): Product | null {
  let raw = input;
  if (isObj(raw) && !("name" in raw)) {
    for (const key of ["product", "data", "item", "result"]) {
      const inner = raw[key];
      if (isObj(inner)) {
        raw = inner;
        break;
      }
    }
  }
  if (!isObj(raw)) return null;

  const e = entriesOf(raw, 2);
  const name = pickWith(e, NAME_KEYS, toText, 0) ?? pickWith(e, NAME_KEYS, toText, 1);
  if (!name) return null;
  const id = pickWith(e, ID_KEYS, toText, 0) ?? String((ctx.index ?? 0) + 1);
  const slug = pickWith(e, SLUG_KEYS, toText, 0) ?? id;
  const unit = cleanUnit(pickWith(e, UNIT_KEYS, toText));

  /* category */
  const categoryRaw = pickWith(
    e,
    CATEGORY_KEYS,
    (v) => (typeof v === "string" || typeof v === "number" || isObj(v) ? v : null),
    1,
  );
  let rawSlug = "";
  let rawName = pickWith(e, CATEGORY_NAME_KEYS, toText) ?? "";
  if (isObj(categoryRaw)) {
    const ce = entriesOf(categoryRaw, 0);
    rawSlug = pickWith(ce, ["slug", "id", "key", "code", "value"], toText) ?? "";
    rawName = pickWith(ce, ["name", "nameBn", "name_bn", "title", "label"], toText) ?? rawName;
  } else if (categoryRaw !== null) {
    rawSlug = String(categoryRaw).trim();
  }
  const known = ctx.categories ?? [];
  const match = known.find(
    (c) =>
      same(c.slug, rawSlug) ||
      same(c.id ?? "", rawSlug) ||
      same(c.name, rawSlug) ||
      same(c.name, rawName) ||
      same(c.slug, rawName),
  );
  const categorySlug = match?.slug ?? (rawSlug || rawName);
  const categoryName = match?.name ?? (rawName || KNOWN_CATEGORY_NAMES[rawSlug.toLowerCase()] || rawSlug);
  const emoji =
    pickWith(e, EMOJI_KEYS, asEmoji) ?? match?.emoji ?? EMOJI_BY_CATEGORY_NAME[categoryName] ?? "🛒";

  /* prices & change */
  let price = pickWith(e, PRICE_KEYS, toNumber);
  const previousPrice = pickWith(e, PREV_KEYS, toNumber);
  const pctRaw = pickWith(e, PCT_KEYS, toNumeric);
  const amountRaw = pickWith(e, AMOUNT_KEYS, toNumeric);
  const changeRaw = pickWith(e, ["change"], toNumeric);

  let direction: Direction | null =
    pickWith(e, DIRECTION_KEYS, toDirectionLoose) ??
    pickWith(e, WEAK_DIRECTION_KEYS, toDirection) ??
    (pickWith(e, UP_FLAGS, (v) => (v === true ? true : null)) ? "up" : null) ??
    (pickWith(e, DOWN_FLAGS, (v) => (v === true ? true : null)) ? "down" : null);
  let pct: number | null = null;
  let amount: number | null = null;

  if (pctRaw !== null) {
    const n = toNumber(pctRaw) as number;
    pct = Math.abs(n);
    direction = direction ?? directionFromSigned(pctRaw, n);
  }
  if (amountRaw !== null) {
    const n = toNumber(amountRaw) as number;
    amount = Math.abs(n);
    direction = direction ?? directionFromSigned(amountRaw, n);
  }
  if (price !== null && previousPrice !== null && previousPrice !== 0) {
    const diff = price - previousPrice;
    if (amount === null) amount = Math.abs(round2(diff));
    if (pct === null) pct = Math.abs((diff / previousPrice) * 100);
    direction = direction ?? (diff > 0 ? "up" : diff < 0 ? "down" : "flat");
  }
  if (pct === null && changeRaw !== null) {
    // a bare "change" is assumed to be the percentage shown on the cards
    const n = toNumber(changeRaw) as number;
    pct = Math.abs(n);
    direction = direction ?? directionFromSigned(changeRaw, n);
  }
  if (pct === null && amount !== null && price !== null && direction && direction !== "flat") {
    const before = direction === "up" ? price - amount : price + amount;
    if (before > 0) pct = (amount / before) * 100;
  }
  if (amount === null && pct !== null && price !== null && pct > 0 && direction && direction !== "flat") {
    const before = direction === "up" ? price / (1 + pct / 100) : price / (1 - pct / 100);
    amount = Math.abs(round2(price - before));
  }
  const changePercent = pct ?? 0;
  if (changePercent === 0 || direction === null) direction = "flat";

  /* markets, min / max / avg */
  const marketsRaw = pickWith(
    e,
    MARKET_LIST_KEYS,
    (v) => (Array.isArray(v) && v.length > 0 && isObj(v[0]) ? v : null),
    1,
  );
  let markets = (marketsRaw ?? []).map(normalizeMarket).filter((m): m is MarketPrice => m !== null);
  if (markets.length === 0) {
    // Unknown key name: use the first array whose items look like "market + prices" rows.
    for (const entry of e) {
      if (entry.depth > 1 || !Array.isArray(entry.value) || entry.value.length === 0 || !isObj(entry.value[0])) continue;
      const rows = entry.value.map(normalizeMarket).filter((m): m is MarketPrice => m !== null);
      if (rows.length > 0 && rows.some((r) => r.market !== "—" && (r.min !== null || r.max !== null || r.avg !== null))) {
        markets = rows;
        break;
      }
    }
  }

  let min = pickWith(e, MIN_KEYS, toNumber);
  let max = pickWith(e, MAX_KEYS, toNumber);
  let avg = pickWith(e, AVG_KEYS, toNumber);
  if (markets.length > 0) {
    const mins = markets.map((m) => m.min ?? m.avg).filter((n): n is number => n !== null);
    const maxs = markets.map((m) => m.max ?? m.avg).filter((n): n is number => n !== null);
    if (min === null && mins.length) min = Math.min(...mins);
    if (max === null && maxs.length) max = Math.max(...maxs);
  }
  if (avg === null && min !== null && max !== null) avg = round2((min + max) / 2);
  if (price === null) price = avg;

  return {
    id,
    slug,
    name,
    emoji,
    unit,
    categorySlug,
    categoryName,
    price,
    previousPrice,
    changeAmount: amount,
    changePercent,
    direction,
    min,
    max,
    avg,
    description: pickWith(e, DESCRIPTION_KEYS, toText, 1),
    markets,
  };
}

export function normalizeProducts(json: unknown, categories: Category[] = []): Product[] {
  const out: Product[] = [];
  extractList(json, ["products", "data", "items", "results", "records"]).forEach((item, index) => {
    const product = normalizeProduct(item, { categories, index });
    if (product) out.push(product);
  });
  return out;
}

/** Fill the gaps of `base` (list item) with the richer `detail` (single-product endpoint). */
export function mergeProducts(base: Product | null, detail: Product | null): Product | null {
  if (!base) return detail;
  if (!detail) return base;
  const pick = <T,>(a: T | null, b: T | null) => (a !== null && a !== undefined ? a : b);
  return {
    ...base,
    ...detail,
    emoji: detail.emoji !== "🛒" ? detail.emoji : base.emoji,
    unit: detail.unit || base.unit,
    categorySlug: detail.categorySlug || base.categorySlug,
    categoryName: detail.categoryName || base.categoryName,
    price: pick(detail.price, base.price),
    previousPrice: pick(detail.previousPrice, base.previousPrice),
    changeAmount: pick(detail.changeAmount, base.changeAmount),
    changePercent: detail.changePercent || base.changePercent,
    direction: detail.changePercent ? detail.direction : base.direction,
    min: pick(detail.min, base.min),
    max: pick(detail.max, base.max),
    avg: pick(detail.avg, base.avg),
    description: pick(detail.description, base.description),
    markets: detail.markets.length ? detail.markets : base.markets,
  };
}
