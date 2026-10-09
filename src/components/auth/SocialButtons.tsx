"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-messages";

type Provider = "google" | "github";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/**
 * "অথবা" divider + Google / GitHub buttons.
 * After a successful social login the user lands on `callbackUrl` (Home by default).
 */
export function SocialButtons({ callbackUrl, errorPath }: { callbackUrl: string; errorPath: "/signin" | "/signup" }) {
  const [pending, setPending] = useState<Provider | null>(null);

  async function handleSocial(provider: Provider) {
    setPending(provider);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl,
      newUserCallbackURL: callbackUrl,
      errorCallbackURL: `${errorPath}?error=oauth`,
    });
    // On success the browser is redirected to the provider, so we only get here on failure.
    if (error) {
      setPending(null);
      toast.error(authErrorMessage(error));
    }
  }

  const buttonClass = "btn w-full gap-1.5 sm:w-auto sm:flex-1 border-base-300 bg-transparent px-3 text-sm font-semibold shadow-none hover:bg-base-200";

  return (
    <>
      <div className="divider my-0 text-xs">অথবা</div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className={buttonClass} disabled={pending !== null} onClick={() => handleSocial("google")}>
          {pending === "google" ? <span className="loading loading-spinner loading-xs" /> : <GoogleIcon />}
          Google দিয়ে চালিয়ে যান
        </button>
        <button type="button" className={buttonClass} disabled={pending !== null} onClick={() => handleSocial("github")}>
          {pending === "github" ? <span className="loading loading-spinner loading-xs" /> : <GitHubIcon />}
          GitHub দিয়ে চালিয়ে যান
        </button>
      </div>
    </>
  );
}
