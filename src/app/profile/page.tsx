import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Avatar } from "@/components/ui/Avatar";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "আমার প্রোফাইল" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect(`/signin?callbackUrl=${encodeURIComponent("/profile")}&reason=login-required`);
  const { user } = session;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold leading-8">আমার প্রোফাইল</h1>
        <p className="text-sm opacity-70">আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।</p>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-6 sm:flex-row">
        <Avatar name={user.name} image={user.image} className="size-20 rounded-2xl text-2xl" />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="truncate text-xl font-medium leading-7">{user.name}</p>
          <p className="truncate opacity-70">{user.email}</p>
        </div>
        <SignOutButton />
      </section>

      <section aria-labelledby="info-title" className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h2 id="info-title" className="text-lg font-semibold leading-7">
          তথ্য
        </h2>
        <div className="mt-3 flex flex-col gap-4 p-3 sm:p-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-name" className="text-sm font-medium">
              নাম
            </label>
            <input
              id="profile-name"
              readOnly
              value={user.name}
              className="input w-full border-base-300 bg-base-100"
            />
          </div>
          {/* C3: the update button leads to its own route with the edit form */}
          <Link href="/profile/update" className="btn btn-primary w-full font-semibold">
            আপডেট
          </Link>
        </div>
      </section>
    </div>
  );
}
