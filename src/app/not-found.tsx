import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "পাতাটি পাওয়া যায়নি" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-12 text-center">
      <p className="text-7xl font-bold tracking-tight text-primary">৪০৪</p>
      <span aria-hidden="true" className="text-5xl">
        🧺
      </span>
      <h1 className="text-2xl font-bold">পাতাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-sm opacity-70">
        আপনি যে পাতা বা পণ্যটি খুঁজছেন সেটি নেই, অথবা ঠিকানাটি ভুল হয়েছে।
      </p>
      <Link href="/" className="btn btn-primary mt-2 font-semibold">
        হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}
