"use client";

import { useEffect } from "react";

/**
 * Sets the browser-tab title once the page content has streamed in.
 * (Doing this from `generateMetadata` would make every client-side navigation wait for the API
 * before the loading skeleton could appear, so the route files only export a static title.)
 */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | বাজার দর`;
  }, [title]);
  return null;
}
