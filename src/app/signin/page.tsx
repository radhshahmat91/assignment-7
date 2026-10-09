import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { safeRedirect } from "@/lib/redirect";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "সাইন ইন" };

type Props = { searchParams: Promise<{ callbackUrl?: string; reason?: string; error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl = safeRedirect(params.callbackUrl);

  // Already signed in? Nothing to do here.
  if (await getSession()) redirect(callbackUrl);

  const reason = params.reason === "login-required" ? "login-required" : params.error === "oauth" ? "oauth-error" : undefined;

  return (
    <AuthShell title="সাইন ইন" subtitle="বিস্তারিত দাম, বাজার তুলনা ও প্রোফাইল দেখতে অ্যাকাউন্টে ঢুকুন।">
      <SignInForm callbackUrl={callbackUrl} reason={reason} />
    </AuthShell>
  );
}
