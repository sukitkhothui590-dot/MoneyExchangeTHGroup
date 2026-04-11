/** Safe path for post-auth redirect (open-redirect guard). */
export function sanitizeAuthNext(raw: string | null): string {
  if (!raw || typeof raw !== "string") return "/";
  try {
    const decoded = decodeURIComponent(raw.trim());
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return "/";
    if (
      decoded.startsWith("/admin") ||
      decoded.startsWith("/pos") ||
      decoded.startsWith("/api")
    ) {
      return "/";
    }
    return decoded;
  } catch {
    return "/";
  }
}
