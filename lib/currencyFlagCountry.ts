/** ISO 4217 currency code → ISO 3166-1 alpha-2 for flagcdn.com */
const CURRENCY_TO_FLAG_COUNTRY: Record<string, string> = {
  THB: "th",
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  CHF: "ch",
  AUD: "au",
  CNY: "cn",
  JPY: "jp",
  MYR: "my",
  SGD: "sg",
  HKD: "hk",
  NZD: "nz",
  CAD: "ca",
  TWD: "tw",
  KRW: "kr",
  PHP: "ph",
  INR: "in",
  AED: "ae",
  SAR: "sa",
  BHD: "bh",
  KWD: "kw",
};

export function currencyCodeToFlagCountry(code: string): string {
  return CURRENCY_TO_FLAG_COUNTRY[code.toUpperCase()] ?? "us";
}

/** ธงอิโมจิจากรหัสสกุลเงิน (ไม่มีในแผนที่ → 💱) */
export function currencyCodeToFlagEmoji(code: string): string {
  const key = code.toUpperCase();
  const alpha2 = CURRENCY_TO_FLAG_COUNTRY[key];
  if (!alpha2) return "💱";
  const cc = alpha2.toUpperCase();
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return "💱";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (cc.charCodeAt(0) - 65),
    base + (cc.charCodeAt(1) - 65),
  );
}
