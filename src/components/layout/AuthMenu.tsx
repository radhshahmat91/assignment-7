"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-messages";

function AuthMenuSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-busy="true" aria-label="লোড হচ্ছে">
      <div className="skeleton h-8 w-[72px] rounded-lg sm:h-10 sm:w-[90px]" />
      <div className="skeleton h-8 w-[76px] rounded-lg sm:h-10 sm:w-[92px]" />
    </div>
  );
}

export function AuthMenu() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isPending) return <AuthMenuSkeleton />;

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/signin" className="btn btn-ghost btn-sm font-semibold sm:btn-md">
          সাইন ইন
        </Link>
        <Link href="/signup" className="btn btn-primary btn-sm font-semibold sm:btn-md">
          সাইন আপ
        </Link>
      </div>
    );
  }

  const { user } = session;

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await authClient.signOut();
    setSigningOut(false);
    setOpen(false);
    if (error) {
      toast.error(authErrorMessage(error));
      return;
    }
    toast.success("সফলভাবে সাইন আউট হয়েছে");
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="ব্যবহারকারীর মেনু"
        className="btn btn-ghost h-10 min-h-10 gap-2 px-[3px] sm:pr-2"
      >
        <Avatar name={user.name} image={user.image} />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline">{user.name}</span>
        <span aria-hidden="true" className={`pr-1 text-xs opacity-60 transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-base-300 bg-base-100 p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs opacity-70">{user.email}</p>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-base-200"
          >
            <span aria-hidden="true">👤</span> আমার প্রোফাইল
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-error transition-colors hover:bg-base-200 disabled:opacity-60"
          >
            <span aria-hidden="true">↩</span> {signingOut ? "সাইন আউট হচ্ছে…" : "সাইন আউট"}
          </button>
        </div>
      )}
    </div>
  );
}
