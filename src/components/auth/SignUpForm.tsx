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

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
}

export function SignUpForm({ callbackUrl, oauthError }: { callbackUrl: string; oauthError?: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const notified = useRef(false);

  useEffect(() => {
    if (!oauthError || notified.current) return;
    notified.current = true;
    toast.error("সোশ্যাল লগইন সম্পন্ন করা যায়নি, আবার চেষ্টা করুন", { id: "oauth-error" });
  }, [oauthError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "নাম কমপক্ষে ২ অক্ষরের হতে হবে";
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "সঠিক একটি ইমেইল দিন";
    if (password.length < 8) next.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
    if (confirm !== password) next.confirm = "দুটি পাসওয়ার্ড মিলছে না";
    setErrors(next);
    const firstError = next.name ?? next.email ?? next.password ?? next.confirm;
    if (firstError) {
      toast.error(firstError);
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
    if (error) {
      setLoading(false);
      const message = authErrorMessage(error);
      setErrors({ form: message });
      toast.error(message);
      return;
    }

    // Registered: send the user to the sign-in page (and on to where they were headed).
    toast.success("অ্যাকাউন্ট তৈরি হয়েছে! এখন সাইন ইন করুন");
    router.push(callbackUrl === "/" ? "/signin" : `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        id="name"
        label="নাম"
        autoComplete="name"
        placeholder="যেমন: রহিম উদ্দিন"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
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
        autoComplete="new-password"
        placeholder="কমপক্ষে ৮ অক্ষর"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <TextField
        id="confirm"
        label="পাসওয়ার্ড নিশ্চিত করুন"
        type="password"
        autoComplete="new-password"
        placeholder="আবার লিখুন"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirm}
      />

      {errors.form && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {errors.form}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full font-semibold" disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে…" : "অ্যাকাউন্ট তৈরি করুন"}
      </button>

      <SocialButtons callbackUrl={callbackUrl} errorPath="/signup" />

      <p className="text-center text-sm">
        অ্যাকাউন্ট আছে?{" "}
        <Link
          href={callbackUrl === "/" ? "/signin" : `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-primary hover:underline"
        >
          সাইন ইন করুন
        </Link>
      </p>
    </form>
  );
}
