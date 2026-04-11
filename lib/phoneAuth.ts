/**
 * Thai mobile → synthetic email for Supabase email/password provider.
 * Enable "Confirm email" off in Supabase or users cannot complete signup without a real inbox.
 */

const AUTH_EMAIL_DOMAIN = "customer.phone.local";

/** Digits only from input */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Normalize to 10-digit Thai mobile starting with 0 (e.g. 0812345678).
 * Accepts 812345678, +66812345678, 66812345678.
 */
export function normalizeThaiMobile(input: string): string {
  let d = digitsOnly(input.trim());
  if (d.length === 9 && /^[6-9]/.test(d)) {
    d = `0${d}`;
  }
  if (d.length === 11 && d.startsWith("66")) {
    d = `0${d.slice(2)}`;
  }
  if (d.length === 12 && d.startsWith("660")) {
    d = d.slice(2);
  }
  return d;
}

/** Basic Thai mobile: 0[6-9] + 8 digits */
export function isValidThaiMobile(normalized: string): boolean {
  return /^0[6-9]\d{8}$/.test(normalized);
}

export function phoneToAuthEmail(normalizedPhone: string): string {
  const d = digitsOnly(normalizedPhone);
  return `${d}@${AUTH_EMAIL_DOMAIN}`;
}

/** E.164 for Supabase SMS OTP (+66812345678) */
export function toE164Thai(normalized: string): string {
  const d = digitsOnly(normalized);
  if (d.startsWith("0") && d.length === 10) {
    return `+66${d.slice(1)}`;
  }
  if (d.length === 9 && /^[6-9]/.test(d)) {
    return `+66${d}`;
  }
  return `+${d}`;
}
