import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/** Centered card layout shared by the sign-in and sign-up pages (max-w-md like the Figma). */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-6 sm:py-10">
      <header className="text-center">
        <h1 className="text-2xl font-bold leading-8">{title}</h1>
        <p className="mt-1 text-sm opacity-70">{subtitle}</p>
      </header>
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">{children}</div>
      <Link href="/" className="text-center text-sm opacity-60 transition-opacity hover:opacity-100">
        ← হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}
