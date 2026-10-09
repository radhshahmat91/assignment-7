"use client";

import { Toaster } from "react-hot-toast";

/** react-hot-toast container (renders `[data-rht-toaster]`), styled like the Figma surface. */
export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 3800,
        style: {
          background: "#fafcfa",
          color: "#1d271f",
          border: "1px solid #e1e8e1",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "10px 14px",
          maxWidth: "min(92vw, 420px)",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },
        success: { iconTheme: { primary: "#05893e", secondary: "#f3fbf4" } },
        error: { iconTheme: { primary: "#d03739", secondary: "#fff5f5" } },
      }}
    />
  );
}
