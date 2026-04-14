/** ชื่อ/ธงสำหรับสกุลที่ซิงก์จาก Frankfurter — ไม่มีใน map จะใช้ code + 🏳️ */
export const CURRENCY_DISPLAY_META: Record<
  string,
  { name_th: string; flag: string }
> = {
  USD: { name_th: "ดอลลาร์สหรัฐ", flag: "🇺🇸" },
  EUR: { name_th: "ยูโร", flag: "🇪🇺" },
  GBP: { name_th: "ปอนด์สหราชอาณาจักร", flag: "🇬🇧" },
  JPY: { name_th: "เยนญี่ปุ่น", flag: "🇯🇵" },
  CNY: { name_th: "หยวนจีน", flag: "🇨🇳" },
  KRW: { name_th: "วอนเกาหลี", flag: "🇰🇷" },
  HKD: { name_th: "ดอลลาร์ฮ่องกง", flag: "🇭🇰" },
  SGD: { name_th: "ดอลลาร์สิงคโปร์", flag: "🇸🇬" },
  AUD: { name_th: "ดอลลาร์ออสเตรเลีย", flag: "🇦🇺" },
  NZD: { name_th: "ดอลลาร์นิวซีแลนด์", flag: "🇳🇿" },
  CHF: { name_th: "ฟรังก์สวิส", flag: "🇨🇭" },
  CAD: { name_th: "ดอลลาร์แคนาดา", flag: "🇨🇦" },
  MYR: { name_th: "ริงกิตมาเลเซีย", flag: "🇲🇾" },
  IDR: { name_th: "รูปีอินโดนีเซีย", flag: "🇮🇩" },
  PHP: { name_th: "เปโซฟิลิปปินส์", flag: "🇵🇭" },
  INR: { name_th: "รูปีอินเดีย", flag: "🇮🇳" },
  TWD: { name_th: "ดอลลาร์ไต้หวัน", flag: "🇹🇼" },
  THB: { name_th: "บาทไทย", flag: "🇹🇭" },
  MXN: { name_th: "เปโซเม็กซิโก", flag: "🇲🇽" },
  BRL: { name_th: "เรอัลบราซิล", flag: "🇧🇷" },
  ZAR: { name_th: "แรนด์แอฟริกาใต้", flag: "🇿🇦" },
  TRY: { name_th: "ลีราตุรกี", flag: "🇹🇷" },
  ILS: { name_th: "เชเกลอิสราเอล", flag: "🇮🇱" },
  SEK: { name_th: "โครนาสวีเดน", flag: "🇸🇪" },
  NOK: { name_th: "โครนนอร์เวย์", flag: "🇳🇴" },
  DKK: { name_th: "โครนเดนมาร์ก", flag: "🇩🇰" },
  PLN: { name_th: "ซวอตีโปแลนด์", flag: "🇵🇱" },
  CZK: { name_th: "โครูนาเช็ก", flag: "🇨🇿" },
  HUF: { name_th: "โฟรินต์ฮังการี", flag: "🇭🇺" },
  RON: { name_th: "ลิวโรมาเนีย", flag: "🇷🇴" },
  ISK: { name_th: "โครนาไอซ์แลนด์", flag: "🇮🇸" },
};

export function currencyMetaForSync(code: string): {
  name: string;
  flag: string;
} {
  const m = CURRENCY_DISPLAY_META[code];
  if (m) return { name: m.name_th, flag: m.flag };
  return { name: code, flag: "🏳️" };
}
