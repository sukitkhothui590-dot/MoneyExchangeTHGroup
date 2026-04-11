import React from "react";

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export default function Skeleton({
  className = "",
  rounded = false,
}: SkeletonProps) {
  return (
    <div
      className={[
        "animate-pulse bg-border",
        rounded ? "rounded-full" : "rounded-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}
