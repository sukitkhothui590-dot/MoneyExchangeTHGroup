import SiteImage from "@/components/site/SiteImage";

/** Full-bleed hero/banner: parent must be `relative` with defined height (e.g. padding or aspect-ratio). */
export default function HeroFillImage({
  src,
  alt,
  priority,
  sizes = "100vw",
  /** Shown in placeholder mode (banner artboard size). */
  placeholderSize = "1440×400",
}: {
  src: string;
  alt: string;
  /** LCP hero — set on first visible banner per page */
  priority?: boolean;
  /** Responsive `sizes` for `fill` (default full viewport width). */
  sizes?: string;
  placeholderSize?: string;
}) {
  return (
    <div className="absolute inset-0">
      <SiteImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        priority={priority ?? false}
        placeholderSize={placeholderSize}
      />
    </div>
  );
}
