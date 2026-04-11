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
  {
    id: "3",
    title: "Private VIP Foreign Exchange Room",
    titleTh: "บริการห้องวีไอพีแลกเงินตราต่างประเทศ",
    description:
      "บริการแลกเงินแบบส่วนตัวสำหรับลูกค้าที่จองเรทและจำนวนเงินล่วงหน้า สะดวก รวดเร็ว และเป็นส่วนตัว",
    icon: "",
    image: "/all-service/3.png",
    link: "/vip-foreign-exchange-room",
  },
];

export async function getServices(): Promise<ServiceItem[]> {
  return mockServices;
}

export function getServicesSync(): ServiceItem[] {
  return mockServices;
}

export { mockServices };
