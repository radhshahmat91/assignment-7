import type { Direction } from "./types";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** "148" -> "১৪৮" */
export function toBnDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/**
 * Bengali number with grouping.
 * Whole numbers have no decimals ("১,৮৫০"), fractions always show two ("৬৩.৫০").
 */
export function formatNumber(value: number): string {
  const whole = Number.isInteger(value);
  const text = value.toLocaleString("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
  return toBnDigits(text);
}

/** 148 -> "১৪৮ টাকা" */
export function formatTaka(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${formatNumber(value)} টাকা`;
}

/** 2.1 -> "২.১%" (always one decimal, like the design) */
export function formatPercent(value: number): string {
  return `${toBnDigits(Math.abs(value).toFixed(1))}%`;
}

/** "কেজি" -> "প্রতি কেজি" */
export function perUnit(unit: string): string {
  return unit ? `প্রতি ${unit}` : "";
}

export function arrowFor(direction: Direction): string {
  return direction === "up" ? "▲" : direction === "down" ? "▼" : "—";
}

/**
 * Tailwind text colour for a price movement.
 * The Figma paints a price RISE (▲) red and a FALL (▼) green - good news for shoppers.
 * (The brief's text says the opposite; to flip it, swap the first two values below.)
 */
export const TONE = {
  up: "text-error",
  down: "text-success",
  flat: "text-base-content/60",
} as const;

export function toneClass(direction: Direction): string {
  return TONE[direction];
}

/** Plain-language sentence used on the product page. */
export function changeSentence(direction: Direction, amount: number | null): string {
  if (direction === "flat") return "গতকালের তুলনায় আজ দাম অপরিবর্তিত";
  const verb = direction === "up" ? "বেড়েছে" : "কমেছে";
  return amount && amount > 0
    ? `গতকালের তুলনায় আজ দাম ${verb} · ${formatNumber(amount)} টাকা`
    : `গতকালের তুলনায় আজ দাম ${verb}`;
}

const WEEKDAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

/**
 * "মঙ্গলবার, ৬ অক্টোবর, ২০২৬" — always in Bangladesh time and built by hand,
 * so server and browser render exactly the same text (no ICU differences).
 */
export function formatBanglaDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const month = Number(get("month")) - 1;
  return `${WEEKDAYS[weekdayIndex]}, ${toBnDigits(get("day"))} ${MONTHS[month]}, ${toBnDigits(get("year"))}`;
}

/** Up to two letters for an avatar fallback. */
export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "?";
  const second = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + second).toUpperCase();
}
