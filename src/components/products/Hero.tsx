import Image from "next/image";
import { TodayDate } from "@/components/ui/TodayDate";
import { formatBanglaDate } from "@/lib/format";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      <div className="flex flex-col items-center gap-6 p-6 sm:p-8 md:flex-row md:justify-between md:gap-8">
        <div className="flex w-full max-w-xl flex-col items-start gap-2">
          <TodayDate
            initial={formatBanglaDate()}
            className="inline-block rounded-[14px] bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          />
          <h1 id="hero-title" className="text-3xl font-bold leading-[1.25] sm:text-4xl">
            আজকের বাজারের দাম এক নজরে
          </h1>
          <p className="mt-1 text-base opacity-70">
            চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বাধিক এবং
            দামের পরিবর্তন এক জায়গায়।
          </p>
          {/* same-page anchor: smooth-scrolls to the "সব পণ্য" section, no route change */}
          <a href="#সব-পণ্য" className="btn btn-primary mt-5 font-semibold">
            সব পণ্য দেখুন
          </a>
        </div>

        <Image
          src="/bazar-hero.png"
          alt="ফলমূল ও সবজিতে ভরা বাজারের ঝুড়ি"
          width={315}
          height={263}
          priority
          className="h-auto w-52 shrink-0 sm:w-60 md:h-[217px] md:w-auto"
        />
      </div>
    </section>
  );
}
