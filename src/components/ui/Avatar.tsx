"use client";

import { useState } from "react";
import { initialsOf } from "@/lib/format";

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  /** size / radius / font-size utilities */
  className?: string;
}

/** Profile picture (from Google / GitHub) with a green initials fallback, like the Figma avatar. */
export function Avatar({ name, image, className = "size-9 rounded-[10px] text-sm" }: AvatarProps) {
  const [broken, setBroken] = useState(false);
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center overflow-hidden bg-primary font-semibold text-primary-content ${className}`}
    >
      {image && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
