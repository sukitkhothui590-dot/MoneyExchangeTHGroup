import { ServiceItem } from "@/lib/types/service";

const mockServices: ServiceItem[] = [
  {
    id: "1",
    title: "MoneyExchangeTHGroup",
    titleTh: "แลกเงิน",
    description: "เรทดี เชื่อถือได้ แลกเงินปลีกโตเรา",
    icon: "",
    image: "/all-service/1.png",
    link: "/spr-money-exchange",
  },
  {
    id: "2",
    title: "MoneyExchangeTHGroup Money Transfer",
    titleTh: "โอนเงินระหว่างประเทศ",
    description: "โอนเงินที่ไหนก็โอนถึงได้ รวดเร็ว ปลอดภัยไร้กังวล",
    icon: "",
    image: "/all-service/2.png",
    link: "/spr-money-transfer",
  },
];

export async function getServices(): Promise<ServiceItem[]> {
  return mockServices;
}

export function getServicesSync(): ServiceItem[] {
  return mockServices;
}

export { mockServices };
