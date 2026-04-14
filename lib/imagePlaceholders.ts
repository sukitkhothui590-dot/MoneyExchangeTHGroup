/** When true, `SiteImage` renders neutral placeholders unless `bypassPlaceholder` is set. */
export function imagePlaceholdersEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_IMAGE_PLACEHOLDERS;
  return v === "true" || v === "1";
}
