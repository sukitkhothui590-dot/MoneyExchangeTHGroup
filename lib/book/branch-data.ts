import { inferProvinceId } from "./thai-provinces";

export type BranchRow = {
  id: string;
  name: string;
  name_th: string;
  address: string;
  address_th: string;
  hours_th: string;
  hours?: string;
  hours_cn?: string;
  status: string;
};

export function withProvince<T extends BranchRow>(row: T): T & { provinceId: string } {
  return {
    ...row,
    provinceId: inferProvinceId(row.address_th || row.address),
  };
}

/** Shown when API returns no branches (demo grid). */
export const FALLBACK_BRANCHES: BranchRow[] = [
  {
    id: "hq",
    name: "Head office (Rama VI)",
    name_th: "สำนักงานใหญ่ พระราม 6",
    address: "Diamond City Hotel, Bangkok",
    address_th:
      "594/23 อาคารโรงแรมไดมอนด์ ซิตี้ ชั้น 1 ถนนพระราม 6 แขวงถนนเพชรบุรี เขตราชเทวี กรุงเทพมหานคร 10400",
    hours_th: "จันทร์–ศุกร์ 09:00–18:00",
    hours: "Mon–Fri 09:00–18:00",
    hours_cn: "周一至周五 09:00–18:00",
    status: "active",
  },
  {
    id: "demo-cnx",
    name: "Chiang Mai branch",
    name_th: "สาขาเชียงใหม่",
    address_th: "ตัวเมืองเชียงใหม่ ถนนนิมมานเหมินทร์ อำเภอเมืองเชียงใหม่ เชียงใหม่ 50200",
    address: "Nimman, Chiang Mai",
    hours_th: "ทุกวัน 10:00–19:00",
    hours: "Daily 10:00–19:00",
    hours_cn: "每日 10:00–19:00",
    status: "active",
  },
  {
    id: "demo-hkt",
    name: "Phuket branch",
    name_th: "สาขาภูเก็ต",
    address_th: "ถนนหาดป่าตอง อำเภอกะทู้ จังหวัดภูเก็ต 83150",
    address: "Patong, Phuket",
    hours_th: "ทุกวัน 09:00–20:00",
    hours: "Daily 09:00–20:00",
    hours_cn: "每日 09:00–20:00",
    status: "active",
  },
];

export function filterByProvince(
  branches: (BranchRow & { provinceId: string })[],
  provinceId: string,
): (BranchRow & { provinceId: string })[] {
  if (provinceId === "all") return branches;
  return branches.filter((b) => b.provinceId === provinceId);
}

export function filterBySearch(
  branches: (BranchRow & { provinceId: string })[],
  q: string,
): (BranchRow & { provinceId: string })[] {
  const s = q.trim().toLowerCase();
  if (!s) return branches;
  return branches.filter(
    (b) =>
      b.name.toLowerCase().includes(s) ||
      b.name_th.includes(q.trim()) ||
      b.address_th.toLowerCase().includes(s) ||
      b.address.toLowerCase().includes(s),
  );
}
