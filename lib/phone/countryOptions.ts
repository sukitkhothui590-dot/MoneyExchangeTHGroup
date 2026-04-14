import {
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

export type PhoneCountryOption = {
  code: CountryCode;
  callingCode: string;
  labelTh: string;
};

let cached: PhoneCountryOption[] | null = null;

/** รายการประเทศ + รหัสโทร (เรียงชื่อภาษาไทย, ไทยอยู่บนสุด) — cache ครั้งเดียว */
export function getPhoneCountryOptions(): PhoneCountryOption[] {
  if (cached) return cached;
  const codes = getCountries();
  let dn: Intl.DisplayNames;
  try {
    dn = new Intl.DisplayNames(["th"], { type: "region" });
  } catch {
    dn = new Intl.DisplayNames(["en"], { type: "region" });
  }
  const list: PhoneCountryOption[] = codes.map((code) => ({
    code,
    callingCode: getCountryCallingCode(code),
    labelTh: dn.of(code) ?? code,
  }));
  list.sort((a, b) => {
    if (a.code === "TH") return -1;
    if (b.code === "TH") return 1;
    return a.labelTh.localeCompare(b.labelTh, "th");
  });
  cached = list;
  return list;
}
