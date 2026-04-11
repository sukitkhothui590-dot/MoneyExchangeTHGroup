import Image, { type ImageProps } from "next/image";
import { imagePlaceholdersEnabled } from "@/lib/imagePlaceholders";

export type SiteImageProps = ImageProps & {
  /** Label in placeholder mode when using `fill` (e.g. "1440×560"). */
  placeholderSize?: string;
  /** When true, always render the real image even if `NEXT_PUBLIC_IMAGE_PLACEHOLDERS` is on (e.g. country flags). */
  bypassPlaceholder?: boolean;
};

function dimensionLabel(
  props: ImageProps,
  placeholderSize: string | undefined,
): string {
  if (placeholderSize?.trim()) return placeholderSize.trim();
  if (typeof props.width === "number" && typeof props.height === "number") {
    return `${props.width}×${props.height}`;
  }
  if (props.fill) return "—×—";
  return "?×?";
}

function Placeholder({
  props,
  placeholderSize,
}: {
  props: ImageProps;
  placeholderSize?: string;
}) {
  const { fill, className, alt, width, height, style } = props;
  const label = dimensionLabel(props, placeholderSize);

  if (fill) {
    return (
      <div
        className={`absolute inset-0 z-0 flex items-center justify-center bg-[#E8EAED] px-3 text-center text-[10px] font-medium leading-tight text-[#7D828A] sm:text-xs font-tabular-nums ${className ?? ""}`}
        role="img"
        aria-label={alt}
      >
        <span className="rounded border border-dashed border-[#BDC1C8] px-3 py-2">
          {label}
        </span>
      </div>
    );
  }

  const w = typeof width === "number" ? width : 200;
  const h = typeof height === "number" ? height : 120;

  return (
    <div
      style={{ width: w, height: h, ...style }}
      className={`inline-flex max-w-full items-center justify-center overflow-hidden bg-[#E8EAED] px-2 text-center text-[10px] font-medium text-[#7D828A] sm:text-xs font-tabular-nums ${className ?? ""}`}
      role="img"
      aria-label={alt}
    >
      <span className="rounded border border-dashed border-[#BDC1C8] px-2 py-1">
        {label}
      </span>
    </div>
  );
}

/** Drop-in replacement for `next/image` — shows gray placeholders when `NEXT_PUBLIC_IMAGE_PLACEHOLDERS` is set. */
export default function SiteImage({
  placeholderSize,
  bypassPlaceholder,
  ...imageProps
}: SiteImageProps) {
  if (imagePlaceholdersEnabled() && !bypassPlaceholder) {
    return (
      <Placeholder props={imageProps} placeholderSize={placeholderSize} />
    );
  }
  return <Image {...imageProps} />;
}
