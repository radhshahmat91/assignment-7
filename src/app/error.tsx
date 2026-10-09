"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-6 py-12 text-center">
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-2xl bg-base-200 text-4xl">
        📡
      </span>
      <h1 className="text-xl font-bold">তথ্য লোড করা যায়নি</h1>
      <p className="text-sm opacity-70">সার্ভারের সাথে সংযোগ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="btn btn-primary font-semibold">
          আবার চেষ্টা করুন
        </button>
        <Link href="/" className="btn border-base-300 bg-transparent font-semibold shadow-none hover:bg-base-200">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
