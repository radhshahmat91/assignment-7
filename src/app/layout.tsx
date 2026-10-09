import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource/hind-siliguri/bengali-400.css";
import "@fontsource/hind-siliguri/bengali-500.css";
import "@fontsource/hind-siliguri/bengali-600.css";
import "@fontsource/hind-siliguri/bengali-700.css";
import "@fontsource/hind-siliguri/latin-400.css";
import "@fontsource/hind-siliguri/latin-500.css";
import "@fontsource/hind-siliguri/latin-600.css";
import "@fontsource/hind-siliguri/latin-700.css";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PriceTicker, TickerSkeleton } from "@/components/layout/PriceTicker";
import { ToasterProvider } from "@/components/ui/ToasterProvider";

export const metadata: Metadata = {
  title: {
    default: "বাজার দর — আজকের নিত্যপ্রয়োজনীয় পণ্যের দাম",
    template: "%s | বাজার দর",
  },
  description:
    "চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার আজকের বাজারদর — বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বাধিক এবং দামের পরিবর্তন এক জায়গায়।",
  applicationName: "বাজার দর",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05893e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" data-theme="bazardor">
      <body className="flex min-h-dvh flex-col">
        <Header />
        <Suspense fallback={<TickerSkeleton />}>
          <PriceTicker />
        </Suspense>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6">{children}</main>
        <Footer />
        <ToasterProvider />
      </body>
    </html>
  );
}
