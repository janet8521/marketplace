"use client";

import { useState } from "react";

// Shows the local hero photo at /public/cover.jpg. If that file isn't there
// yet, it falls back to a stock living-room image so the page never breaks.
const FALLBACK =
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80";

export function CoverImage({ className }: { className?: string }) {
  const [src, setSrc] = useState("/cover.jpg");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Featured room setting"
      onError={() => setSrc(FALLBACK)}
      className={className}
    />
  );
}
