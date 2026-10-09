"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-messages";
import { SocialButtons } from "./SocialButtons";
import { TextField } from "./TextField";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignInFormProps {
  /** where to go after signing in (Home unless the user was bounced from a protected page) */
  callbackUrl: string;
  /** why the user ended up here */
  reason?: "login-required" | "oauth-error";
}

export function SignInForm({ callbackUrl, reason }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const notified = useRef(false);

  // Toast for protected-route redirects and failed social logins.
  useEffect(() => {
    if (!reason || notified.current) return;
    notified.current = true;
    if (reason === "login-required") {
      toast("বিস্তারিত দেখতে অনুগ্রহ করে আগে সাইন ইন করুন", { id: "login-required", icon: "🔒" });
    } else {
      toast.error("সোশ্যাল লগইন সম্পন্ন করা যায়নি, আবার চেষ্টা করুন", { id: "oauth-error" });
    }
  }, [reason]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "সঠিক একটি ইমেইল দিন";
    if (!password) next.password = "পাসওয়ার্ড লিখুন";
    setErrors(next);
    if (next.email || next.password) {
      toast.error(next.email ?? next.password ?? "তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signIn.email({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      const message = authErrorMessage(error);
      setErrors({ form: message });
      toast.error(message);
      return;
    }

    toast.dismiss("login-required");
    toast.success("সফলভাবে সাইন ইন হয়েছে");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        id="email"
        label="ইমেইল"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <TextField
        id="password"
        label="পাসওয়ার্ড"
        type="password"
        autoComplete="current-password"
        placeholder="কমপক্ষে ৮ অক্ষর"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      {errors.form && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {errors.form}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full font-semibold" disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? "সাইন ইন হচ্ছে…" : "সাইন ইন"}
      </button>

      <SocialButtons callbackUrl={callbackUrl} errorPath="/signin" />

      <p className="text-center text-sm">
        অ্যাকাউন্ট নেই?{" "}
        <Link
          href={callbackUrl === "/" ? "/signup" : `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-primary hover:underline"
        >
          সাইন আপ করুন
        </Link>
      </p>
    </form>
  );
}
