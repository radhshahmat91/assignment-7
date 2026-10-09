"use client";

import { useEffect, useState } from "react";
import { formatBanglaDate } from "@/lib/format";

/**
 * Today's date in Bangla ("মঙ্গলবার, ৬ অক্টোবর, ২০২৬").
 * Pages can be cached, so the date is refreshed in the browser right after hydration.
 */
export function TodayDate({ initial, className }: { initial: string; className?: string }) {
  const [text, setText] = useState(initial);
  useEffect(() => {
    setText(formatBanglaDate());
  }, []);
  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}
