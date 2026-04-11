import { CurrencyRate, RateData } from "@/lib/types/rate";

const mockRates: CurrencyRate[] = [
  {
    code: "USD", name: "United States", flag: "🇺🇸", buy: 30.93, sell: 31.03,
    denominations: [
      { denom: "100-50", buy: 30.93, sell: 31.03 },
      { denom: "20-10", buy: 30.80, sell: 30.98 },
      { denom: "5", buy: 30.70, sell: 30.98 },
      { denom: "2-1", buy: 30.35, sell: 30.88 },
    ],
  },
  {
    code: "EUR", name: "European Union", flag: "🇪🇺", buy: 36.40, sell: 36.65,
    denominations: [
      { denom: "500-100", buy: 36.40, sell: 36.65 },
      { denom: "50", buy: 36.35, sell: 36.65 },
      { denom: "20-5", buy: 36.30, sell: 36.65 },
    ],
  },
  {
    code: "GBP", name: "United Kingdom", flag: "🇬🇧", buy: 41.75, sell: 42.00,
    denominations: [
      { denom: "50", buy: 41.75, sell: 42.00 },
      { denom: "20-5", buy: 41.70, sell: 42.00 },
    ],
  },
  {
    code: "CHF", name: "Switzerland", flag: "🇨🇭", buy: 39.85, sell: 40.15,
    denominations: [
      { denom: "1000-10", buy: 39.85, sell: 40.15 },
    ],
  },
  {
    code: "AUD", name: "Australia", flag: "🇦🇺", buy: 21.90, sell: 22.10,
    denominations: [
      { denom: "100-5", buy: 21.90, sell: 22.10 },
    ],
  },
  {
    code: "CNY", name: "China", flag: "🇨🇳", buy: 4.510, sell: 4.560,
    denominations: [
      { denom: "100-50", buy: 4.510, sell: 4.560 },
      { denom: "20-10", buy: 4.110, sell: 4.460 },
      { denom: "5-1", buy: 3.800, sell: 4.460 },
    ],
  },
  {
    code: "JPY", name: "Japan", flag: "🇯🇵", buy: 0.1995, sell: 0.2015,
    denominations: [
      { denom: "10000-1000", buy: 0.1995, sell: 0.2015 },
    ],
  },
  {
    code: "MYR", name: "Malaysia", flag: "🇲🇾", buy: 7.880, sell: 7.960,
    denominations: [
      { denom: "100-50", buy: 7.880, sell: 7.960 },
      { denom: "20-10", buy: 7.380, sell: 7.960 },
    ],
  },
  {
    code: "SGD", name: "Singapore", flag: "🇸🇬", buy: 24.10, sell: 24.30,
    denominations: [
      { denom: "1000-2", buy: 24.10, sell: 24.30 },
    ],
  },
  {
    code: "HKD", name: "Hong Kong", flag: "🇭🇰", buy: 3.95, sell: 4.02,
    denominations: [
      { denom: "1000-10", buy: 3.95, sell: 4.02 },
    ],
  },
  {
    code: "NZD", name: "New Zealand", flag: "🇳🇿", buy: 19.45, sell: 19.85,
    denominations: [
      { denom: "100-5", buy: 19.45, sell: 19.85 },
    ],
  },
  {
    code: "CAD", name: "Canada", flag: "🇨🇦", buy: 22.45, sell: 22.75,
    denominations: [
      { denom: "100-5", buy: 22.45, sell: 22.75 },
    ],
  },
  {
    code: "TWD", name: "Taiwan", flag: "🇹🇼", buy: 0.955, sell: 1.015,
    denominations: [
      { denom: "1000-100", buy: 0.955, sell: 1.015 },
    ],
  },
  {
    code: "KRW", name: "South Korea", flag: "🇰🇷", buy: 0.0220, sell: 0.0236,
    denominations: [
      { denom: "50000-1000", buy: 0.0220, sell: 0.0236 },
    ],
  },
  {
    code: "PHP", name: "Philippines", flag: "🇵🇭", buy: 0.535, sell: 0.575,
    denominations: [
      { denom: "1000-20", buy: 0.535, sell: 0.575 },
    ],
  },
  {
    code: "INR", name: "India", flag: "🇮🇳", buy: 0.356, sell: 0.396,
    denominations: [
      { denom: "2000-10", buy: 0.356, sell: 0.396 },
    ],
  },
  {
    code: "AED", name: "UAE", flag: "🇦🇪", buy: 8.40, sell: 8.55,
    denominations: [
      { denom: "1000-5", buy: 8.40, sell: 8.55 },
    ],
  },
  {
    code: "SAR", name: "Saudi Arabia", flag: "🇸🇦", buy: 8.15, sell: 8.45,
    denominations: [
      { denom: "500-1", buy: 8.15, sell: 8.45 },
    ],
  },
  {
    code: "BHD", name: "Bahrain", flag: "🇧🇭", buy: 81.50, sell: 82.50,
    denominations: [
      { denom: "20-0.5", buy: 81.50, sell: 82.50 },
    ],
  },
  {
    code: "KWD", name: "Kuwait", flag: "🇰🇼", buy: 100.45, sell: 101.95,
    denominations: [
      { denom: "20-0.25", buy: 100.45, sell: 101.95 },
    ],
  },
];

export async function getRates(): Promise<RateData> {
  return {
    rates: mockRates,
    lastUpdated: "26/02/2026, 16:35",
    branch: "Ratchadamri 1 (ราชดำริ 1)",
  };
}

export function getRatesSync(): RateData {
  return {
    rates: mockRates,
    lastUpdated: "26/02/2026, 16:35",
    branch: "Ratchadamri 1 (ราชดำริ 1)",
  };
}

export { mockRates };
