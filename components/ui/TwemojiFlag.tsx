"use client";

import { useEffect, useRef } from "react";
import twemoji from "@twemoji/api";

interface TwemojiFlagProps {
  emoji?: string;
  className?: string;
  fallback?: string;
}

/** Renders flag emoji via Twemoji SVG. Not gated by `NEXT_PUBLIC_IMAGE_PLACEHOLDERS` — that flag is for large `SiteImage` assets only. */
export default function TwemojiFlag({
  emoji,
  className = "",
  fallback = "💱",
}: TwemojiFlagProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const value = emoji?.trim() || fallback;

  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = value;
    twemoji.parse(ref.current, {
      folder: "svg",
      ext: ".svg",
    });
  }, [value]);

  return <span ref={ref} className={className} aria-hidden="true" />;
}
