import { arrowFor, formatPercent, toneClass } from "@/lib/format";
import type { Direction } from "@/lib/types";

const LABEL: Record<Direction, string> = {
  up: "দাম বেড়েছে",
  down: "দাম কমেছে",
  flat: "দাম অপরিবর্তিত",
};

/** `▲ ২.১%` / `▼ ২.৯%` / `— ০.০%` pill used on cards, the ticker and the product page. */
export function PriceBadge({ direction, percent, className = "" }: { direction: Direction; percent: number; className?: string }) {
  return (
    <span
      className={`badge h-6 gap-1 whitespace-nowrap border-0 bg-base-200 px-2 text-xs ${toneClass(direction)} ${className}`}
    >
      <span aria-hidden="true">{arrowFor(direction)}</span>
      <span className="font-semibold">{formatPercent(percent)}</span>
      <span className="sr-only">{LABEL[direction]}</span>
    </span>
  );
}
