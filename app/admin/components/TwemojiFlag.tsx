"use client";

import { useEffect, useRef } from "react";
import twemoji from "@twemoji/api";

interface TwemojiFlagProps {
  emoji: string;
  className?: string;
}

export default function TwemojiFlag({
  emoji,
  className = "",
}: TwemojiFlagProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = emoji;
      twemoji.parse(ref.current, {
        folder: "svg",
        ext: ".svg",
      });
    }
  }, [emoji]);

  return (
    <span
      ref={ref}
      className={`inline-flex items-center [&>img]:w-5 [&>img]:h-5 ${className}`}
    />
  );
}
