/**
 * แปลงผลลัพธ์จาก OCR → identity key + ชื่อ
 * รองรับ: MRZ (พาสปอร์ต TD3, บัตร TD1/TD2) และเลขบัตร ปชช. ไทย 13 หลัก
 */
import { parse } from "mrz";

export type IdentityResolved =
  | {
      source: "mrz";
      identityKey: string;
      fullName: string;
      documentNumber: string;
      issuingState: string;
      format: string;
    }
  | {
      source: "th_national_id";
      identityKey: string;
      fullName: string;
      nationalId: string;
    }
  | {
      source: "card_reader";
      identityKey: string;
      fullName: string;
      nationalId?: string;
    }
  | {
      source: "external_key";
      identityKey: string;
      fullName: string;
    };

export function thNationalIdKey(digits13: string): string {
  return `TH-NID|${digits13}`;
}

function validThaiNationalIdChecksum(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]!, 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(id[12]!, 10);
}

/**
 * STRICT Thai NID extraction from raw text.
 *
 * Instead of stripping ALL non-digits and sliding a window (which produces
 * ghost matches from OCR noise), we look for recognisable patterns:
 *
 * 1. Exact 13 contiguous digits: "1100600123456"
 * 2. Thai NID printed format:    "1-1006-00123-45-6" or "1 1006 00123 45 6"
 * 3. A line that is MOSTLY digits (≥80% digit chars) and contains exactly 13
 *    digits after removing non-digits — this catches OCR lines like
 *    "1 1006 00l23 45 6" where 'l' is misread as a letter.
 *
 * We do NOT do a sliding-window over the entire document's digits, which
 * was producing false positives from noisy OCR.
 */
function extractThaiNationalIdStrict(text: string): string | null {
  // Strategy 1: look for 13 contiguous digits anywhere in the text
  const contiguous = text.match(/\d{13}/g);
  if (contiguous) {
    for (const m of contiguous) {
      if (validThaiNationalIdChecksum(m)) return m;
    }
  }

  // Strategy 2: look for Thai NID printed format X-XXXX-XXXXX-XX-X
  const formatted = text.match(
    /\d[\s\-.]?\d{4}[\s\-.]?\d{5}[\s\-.]?\d{2}[\s\-.]?\d/g,
  );
  if (formatted) {
    for (const m of formatted) {
      const digits = m.replace(/\D/g, "");
      if (digits.length === 13 && validThaiNationalIdChecksum(digits)) {
        return digits;
      }
    }
  }

  // Strategy 3: per-line analysis — a line that is mostly digits
  const lines = text.split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const digitChars = trimmed.replace(/\D/g, "");
    const nonSpaceLen = trimmed.replace(/\s/g, "").length;
    if (nonSpaceLen === 0) continue;
    const digitRatio = digitChars.length / nonSpaceLen;
    // Line must be ≥ 70% digits and yield exactly 13 digits
    if (digitRatio >= 0.7 && digitChars.length === 13) {
      if (validThaiNationalIdChecksum(digitChars)) return digitChars;
    }
  }

  return null;
}

/**
 * Legacy loose extraction — ONLY used for card reader data where the input
 * is known to be clean (chip data, not noisy OCR).
 */
function extractThaiNationalIdLoose(digits: string): string | null {
  if (digits.length === 13 && validThaiNationalIdChecksum(digits)) return digits;
  if (digits.length > 13 && digits.length <= 20) {
    for (let i = 0; i <= digits.length - 13; i++) {
      const slice = digits.slice(i, i + 13);
      if (validThaiNationalIdChecksum(slice)) return slice;
    }
  }
  return null;
}

function normalizeMrzName(last: string, first: string): string {
  const a = last.replace(/</g, " ").replace(/\s+/g, " ").trim();
  const b = first.replace(/</g, " ").replace(/\s+/g, " ").trim();
  return [a, b].filter(Boolean).join(" ").trim() || "—";
}

/** ลอง parse MRZ จากข้อความ (จาก OCR) */
function tryParseMrz(text: string): IdentityResolved | null {
  try {
    const result = parse(text, { autocorrect: true });
    const fmt = result.format;
    if (fmt !== "TD1" && fmt !== "TD2" && fmt !== "TD3") return null;
    const docNum = String(result.documentNumber ?? "")
      .replace(/</g, "")
      .replace(/\s/g, "")
      .toUpperCase();
    if (!docNum) return null;
    const issuing = String(result.fields.issuingState ?? "UNK")
      .replace(/</g, "")
      .replace(/\s/g, "")
      .toUpperCase()
      .slice(0, 3);
    const fullName = normalizeMrzName(
      String(result.fields.lastName ?? ""),
      String(result.fields.firstName ?? ""),
    );
    return {
      source: "mrz",
      identityKey: `ICAO|${fmt}|${issuing}|${docNum}`,
      fullName,
      documentNumber: docNum,
      issuingState: issuing,
      format: fmt,
    };
  } catch {
    return null;
  }
}

/**
 * Parse ข้อมูลจากเครื่องเสียบบัตร (card reader)
 * ข้อมูลจาก card reader เป็นข้อมูลสะอาด (จาก chip) ใช้ loose extraction ได้
 */
export function resolveCardReaderData(rawData: string): IdentityResolved | null {
  const text = rawData.trim();
  if (!text) return null;

  const mrz = tryParseMrz(text);
  if (mrz) return mrz;

  // delimited format: NID|TITLE|FNAME|LNAME or NID;FNAME;LNAME etc.
  const parts = text.split(/[|;,\t]+/).map((s) => s.trim());
  if (parts.length >= 2) {
    const digits = parts[0]!.replace(/\D/g, "");
    const nid = extractThaiNationalIdLoose(digits);
    if (nid) {
      const nameParts = parts.slice(1).filter(Boolean);
      const fullName = nameParts.join(" ").trim() || "ลูกค้า (เสียบบัตร)";
      return {
        source: "card_reader",
        identityKey: thNationalIdKey(nid),
        fullName,
        nationalId: nid,
      };
    }
  }

  // plain digits
  const allDigits = text.replace(/\D/g, "");
  const nid = extractThaiNationalIdLoose(allDigits);
  if (nid) {
    return {
      source: "card_reader",
      identityKey: thNationalIdKey(nid),
      fullName: "ลูกค้า (เสียบบัตร)",
      nationalId: nid,
    };
  }

  // fallback: if it looks like an external key
  if (EXTERNAL_KEY_RE.test(text)) {
    return {
      source: "external_key",
      identityKey: text,
      fullName: "ลูกค้า (เสียบบัตร)",
    };
  }

  return null;
}

const EXTERNAL_KEY_RE = /^[A-Za-z0-9_|.\-:]{8,200}$/;

export type ResolveIdentityInput = {
  identity_lookup_key?: string;
  raw?: string;
  full_name?: string;
};

export function decomposeKey(key: string): IdentityResolved | null {
  const name = "—";

  const icaoMatch = key.match(/^ICAO\|(\w+)\|(\w+)\|(.+)$/);
  if (icaoMatch) {
    return {
      source: "mrz",
      identityKey: key,
      fullName: name,
      documentNumber: icaoMatch[3]!,
      issuingState: icaoMatch[2]!,
      format: icaoMatch[1]!,
    };
  }

  const nidMatch = key.match(/^TH-NID\|(\d{13})$/);
  if (nidMatch) {
    return {
      source: "th_national_id",
      identityKey: key,
      fullName: name,
      nationalId: nidMatch[1]!,
    };
  }

  return null;
}

/**
 * ตัวหลัก: แปลงข้อมูล (จาก OCR, bridge, หรือ manual) เป็น identity key
 * ลำดับ: identity_lookup_key → MRZ parse → Thai NID (strict)
 */
export function resolveIdentityInput(
  input: ResolveIdentityInput,
): IdentityResolved | null {
  const keyIn = input.identity_lookup_key?.trim() ?? "";
  const nameIn = input.full_name?.trim().slice(0, 120) || "";

  if (keyIn && EXTERNAL_KEY_RE.test(keyIn)) {
    const decomposed = decomposeKey(keyIn);
    if (decomposed) {
      if (nameIn) decomposed.fullName = nameIn;
      return decomposed;
    }
    return {
      source: "external_key",
      identityKey: keyIn,
      fullName: nameIn || "ลูกค้า (ยืนยันด้วยเครื่องสแกน)",
    };
  }

  const text = (input.raw ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return null;

  const mrz = tryParseMrz(text);
  if (mrz) return mrz;

  // Use STRICT extraction for OCR text — no sliding window on all digits
  const nid = extractThaiNationalIdStrict(text);
  if (nid) {
    return {
      source: "th_national_id",
      identityKey: thNationalIdKey(nid),
      fullName: "ลูกค้า (เลขบัตร ปชช.)",
      nationalId: nid,
    };
  }

  return null;
}
