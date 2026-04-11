import { NewsItem } from "@/lib/types/news";

const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Around Lifestyle Station Branch (PTT Station, Soi Phetchaburi 31)",
    date: "20 ก.พ. 2026",
    excerpt:
      "MoneyExchangeTHGroup (Orange) สาขา Around Lifestyle Station (ปั้ม ปตท. ซอยเพชรบุรี 31) โฉมใหม่! พร้อมให้บริการแล้ว! เปิดบริการทุกวัน 10:00 - 19:00 น. แล้วมาแลกเงินกับเรา",
    image: "/new/1fe4449e-bf9e-40cf-a5a2-75385949fab1.webp",
    slug: "around-lifestyle-station-branch",
    category: "ประกาศ",
    content: "MoneyExchangeTHGroup (Orange) สาขา Around Lifestyle Station",
  },
  {
    id: "2",
    title: "Now Open! MoneyExchangeTHGroup",
    date: "3 ก.พ. 2026",
    excerpt:
      "แลกเงินแรก! ในสถานที่สวยที่สุดในไทย! พบกับ พวกเรา MoneyExchangeTHGroup สีส้ม สาขาใหม่ล่าสุด ที่พร้อมเปิดให้บริการแล้ววันนี้ MRT...",
    image: "/new/5e766609-6283-4ccd-9d35-5ede9b7be1ac.webp",
    slug: "now-open-moneyexchangethgroup",
    category: "ประกาศ",
    content: "แลกเงินแรก! ในสถานที่สวยที่สุดในไทย!",
  },
  {
    id: "3",
    title: "MoneyExchangeTHGroup Money Transfer",
    date: "13 ม.ค. 2026",
    excerpt:
      "MoneyExchangeTHGroup Money Transfer บริการโอน-รับเงินระหว่างประเทศ ครอบคลุมกว่า 200 ประเทศ ทั่วโลกทันที! กิจกรรมสมัครสมาชิกสุด Exclusive เริ่ม...",
    image: "/new/acc7666d-0238-4ec4-95f8-a523e39805e3.webp",
    slug: "moneyexchangethgroup-transfer",
    category: "โปรโมชั่น",
    content: "MoneyExchangeTHGroup Money Transfer บริการโอน รับเงินระหว่างประเทศ",
  },
  {
    id: "4",
    title: "MoneyExchangeTHGroup (Orange) เปิดสาขาใหม่ MRT กำแพงเพชร",
    date: "2 ธ.ค. 2025",
    excerpt:
      "สถิติ MRT กำแพงเพชร (ทางออก 2) เวลา ทำการ: ทุกวันศุกร์ - อาทิตย์ 10:00 น. - 19:00 น. พิเศษ! ลดอัตราค่าโอนเงินให้สมาชิก...",
    image: "/new/b050e307-9f5e-4b78-9ba7-3d3d7d01d0fe.webp",
    slug: "moneyexchangethgroup-orange-mrt-kamphaengphet",
    category: "ประกาศ",
    content: "MoneyExchangeTHGroup (Orange) เปิดสาขาใหม่ MRT กำแพงเพชร",
  },
];

export async function getNews(): Promise<NewsItem[]> {
  return mockNews;
}

export function getNewsSync(): NewsItem[] {
  return mockNews;
}

export { mockNews };
