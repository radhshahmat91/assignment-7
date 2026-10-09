/** Only allow in-app paths so `?callbackUrl=` cannot be used as an open redirect. */
export function safeRedirect(value: string | string[] | undefined | null, fallback = "/"): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  return path;
}
