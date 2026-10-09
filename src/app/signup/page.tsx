import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { safeRedirect } from "@/lib/redirect";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "সাইন আপ" };

type Props = { searchParams: Promise<{ callbackUrl?: string; error?: string }> };

export default async function SignUpPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = safeRedirect(params.callbackUrl);

  if (await getSession()) redirect(callbackUrl);

  return (
    <AuthShell title="অ্যাকাউন্ট তৈরি করুন" subtitle="বিনা খরচে সাইন আপ করে সব বিস্তারিত দাম দেখুন।">
      <SignUpForm callbackUrl={callbackUrl} oauthError={params.error === "oauth"} />
    </AuthShell>
  );
}
