"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-messages";
import { TextField } from "./TextField";

/** C3 — change the display name with Better Auth's `updateUser`. */
export function ProfileUpdateForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      const message = "নাম কমপক্ষে ২ অক্ষরের হতে হবে";
      setError(message);
      toast.error(message);
      return;
    }
    setError(undefined);
    if (trimmed === initialName) {
      toast("নামে কোনো পরিবর্তন করা হয়নি", { icon: "ℹ️" });
      return;
    }

    setLoading(true);
    const { error: updateError } = await authClient.updateUser({ name: trimmed });
    if (updateError) {
      setLoading(false);
      toast.error(authErrorMessage(updateError));
      return;
    }

    toast.success("প্রোফাইল সফলভাবে আপডেট হয়েছে");
    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        id="name"
        label="নাম"
        autoComplete="name"
        placeholder="আপনার নাম লিখুন"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error}
        autoFocus
      />
      <button type="submit" className="btn btn-primary w-full font-semibold" disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? "আপডেট হচ্ছে…" : "তথ্য আপডেট করুন"}
      </button>
      <Link href="/profile" className="btn btn-ghost w-full font-semibold">
        বাতিল করুন
      </Link>
    </form>
  );
}
