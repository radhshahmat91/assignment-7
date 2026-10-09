import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileUpdateForm } from "@/components/auth/ProfileUpdateForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "তথ্য আপডেট করুন" };

export default async function UpdateProfilePage() {
  const session = await getSession();
  if (!session) redirect(`/signin?callbackUrl=${encodeURIComponent("/profile/update")}&reason=login-required`);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-4 sm:py-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold leading-8">তথ্য আপডেট করুন</h1>
        <p className="mt-1 text-sm opacity-70">আপনার প্রোফাইলে দেখানো নামটি এখানে বদলাতে পারবেন।</p>
      </header>
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <ProfileUpdateForm initialName={session.user.name} />
      </div>
      <Link href="/profile" className="text-center text-sm opacity-60 transition-opacity hover:opacity-100">
        ← প্রোফাইলে ফিরে যান
      </Link>
    </div>
  );
}
