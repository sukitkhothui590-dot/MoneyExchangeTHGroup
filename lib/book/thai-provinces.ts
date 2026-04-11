/** Province slugs for filters; names match common address text in Thai. */
export type ThaiProvince = {
  id: string;
  nameTh: string;
  nameEn: string;
};

export const THAI_PROVINCES_ALL: ThaiProvince = {
  id: "all",
  nameTh: "ทุกจังหวัด",
  nameEn: "All provinces",
};

/** Subset + common coverage; extend as needed. */
export const THAI_PROVINCES: ThaiProvince[] = [
  THAI_PROVINCES_ALL,
  { id: "bangkok", nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok" },
  { id: "chonburi", nameTh: "ชลบุรี", nameEn: "Chon Buri" },
  { id: "chiang_mai", nameTh: "เชียงใหม่", nameEn: "Chiang Mai" },
  { id: "chiang_rai", nameTh: "เชียงราย", nameEn: "Chiang Rai" },
  { id: "phuket", nameTh: "ภูเก็ต", nameEn: "Phuket" },
  { id: "songkhla", nameTh: "สงขลา", nameEn: "Songkhla" },
  { id: "khon_kaen", nameTh: "ขอนแก่น", nameEn: "Khon Kaen" },
  { id: "udon", nameTh: "อุดรธานี", nameEn: "Udon Thani" },
  { id: "nakhon_ratchasima", nameTh: "นครราชสีมา", nameEn: "Nakhon Ratchasima" },
  { id: "phitsanulok", nameTh: "พิษณุโลก", nameEn: "Phitsanulok" },
  { id: "surat", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani" },
  { id: "krabi", nameTh: "กระบี่", nameEn: "Krabi" },
  { id: "prachuap", nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan" },
  { id: "rayong", nameTh: "ระยอง", nameEn: "Rayong" },
  { id: "nonthaburi", nameTh: "นนทบุรี", nameEn: "Nonthaburi" },
  { id: "pathum", nameTh: "ปทุมธานี", nameEn: "Pathum Thani" },
  { id: "samut_prakan", nameTh: "สมุทรปราการ", nameEn: "Samut Prakan" },
  { id: "other", nameTh: "อื่นๆ", nameEn: "Other" },
];

export function inferProvinceId(addressTh: string): string {
  const s = addressTh.trim();
  if (!s) return "other";
  for (const p of THAI_PROVINCES) {
    if (p.id === "all") continue;
    if (s.includes(p.nameTh)) return p.id;
  }
  if (/กรุงเทพ|พระราม|ราชเทวี|บางรัก|สาทร|ห้วยขวาง/i.test(s))
    return "bangkok";
  return "other";
}
