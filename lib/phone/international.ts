import type { CountryCode, PhoneNumber } from "libphonenumber-js";
import {
  isSupportedCountry,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

/** ประเทศเริ่มต้นเมื่อไม่มีรหัสประเทศ (+) — เลขท้องถิ่นไทยยังใช้ได้ตามเดิม */
const DEFAULT_REGION = "TH" as const;

/**
 * พยายามแปลงสตริงเป็นเบอร์สากลที่ตรวจสอบแล้ว
 * รองรับ +CC…, รหัสประเทศ, และเลขท้องถิ่นไทย (เมื่อระบุ DEFAULT_REGION)
 */
export function tryParseInternationalPhone(raw: string): PhoneNumber | null {
  const t = raw.trim();
  if (!t) return null;
  const withRegion = parsePhoneNumberFromString(t, DEFAULT_REGION);
  if (withRegion?.isValid()) return withRegion;
  const intl = parsePhoneNumberFromString(t);
  if (intl?.isValid()) return intl;
  return null;
}

/** เลขท้องถิ่น + รหัสประเทศ ISO (เช่น TH + 0812345678) */
export function tryParseNationalPhone(
  national: string,
  country: string,
): PhoneNumber | null {
  const t = national.trim();
  const c = country.trim().toUpperCase();
  if (!t || !c || !isSupportedCountry(c)) return null;
  const p = parsePhoneNumberFromString(t, c as CountryCode);
  return p?.isValid() ? p : null;
}

/** เก็บใน DB แบบ E.164 (+66812345678, +14155550123, …) */
export function toE164(parsed: PhoneNumber): string {
  return parsed.format("E.164");
}

/**
 * รูปแบบที่อาจเคยบันทึกไว้ก่อนหน้า — ใช้ค้นหาซ้ำ
 * (เน้น E.164 + รูปแบบเบอร์ไทยแบบ 0xx / 66xx)
 */
export function phoneLookupVariants(parsed: PhoneNumber): string[] {
  const s = new Set<string>();
  const e164 = parsed.format("E.164");
  s.add(e164);
  const nat = String(parsed.nationalNumber);
  const cc = parsed.countryCallingCode;
  s.add(`+${cc}${nat}`);

  if (parsed.country === "TH") {
    s.add(`0${nat}`);
    s.add(nat);
    s.add(`66${nat}`);
  }

  return [...s];
}
