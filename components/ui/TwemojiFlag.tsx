"use client";

import { useEffect, useRef } from "react";
import twemoji from "@twemoji/api";
import { imagePlaceholdersEnabled } from "@/lib/imagePlaceholders";

interface TwemojiFlagProps {
  emoji?: string;
  className?: string;
  fallback?: string;
}

export default function TwemojiFlag({
  emoji,
  className = "",
  fallback = "💱",
}: TwemojiFlagProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const value = emoji?.trim() || fallback;
  const ph = imagePlaceholdersEnabled();

  useEffect(() => {
    if (ph) return;
    if (!ref.current) return;
    ref.current.textContent = value;
    twemoji.parse(ref.current, {
      folder: "svg",
      ext: ".svg",
    });
  }, [value, ph]);

  if (ph) {
    return (
      <span className={className} aria-hidden>
        <span className="inline-block h-5 w-5 rounded-full bg-[#D1D5DB] ring-1 ring-[#BDC1C8]" />
      </span>
    );
  }

  return <span ref={ref} className={className} aria-hidden="true" />;
}
