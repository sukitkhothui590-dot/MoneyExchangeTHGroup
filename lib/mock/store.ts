"use client";

import type { BookingStatus, Member } from "@/lib/types/database";
import {
  createDefaultKyc,
  normalizeMockMember,
  type MockMember,
} from "@/lib/mock/memberKyc";

const PREFIX = "mxth_mock_";

export type MockTxn = {
  id: string;
  created_at: string;
  member_id: string;
  member_name: string;
  currency_code: string;
  amount: number;
  rate: number;
  total_thb: number;
  staff_label: string;
  branch_id: string;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

const seedMembers: MockMember[] = [
  normalizeMockMember({
    id: "m1",
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    phone: "0812345678",
    status: "active",
    join_date: new Date().toISOString(),
    wallet_balance: 5000,
    verified: true,
    created_at: new Date().toISOString(),
    kyc: {
      legal_name: "สมชาย ใจดี",
      date_of_birth: "1990-05-15",
      nationality: "TH",
      residence_country: "TH",
      id_doc_type: "national_id",
      id_doc_number: "1-2345-67890-12-3",
      id_doc_expires_at: "2032-12-31",
      kyc_status: "approved",
      address_line: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
      pep_status: "no",
      sanctions_checked_at: new Date().toISOString(),
      sanctions_clear: true,
      risk_tier: "low",
      risk_note: "",
      service_purpose: "ท่องเที่ยว / แลกเงินส่วนตัว",
      source_of_funds_note: "",
      kyc_tier: 2,
      terms_consent_at: new Date().toISOString(),
      internal_note: "",
      doc_front_placeholder: "uploaded",
      doc_back_placeholder: "uploaded",
      last_reviewed_at: new Date().toISOString(),
      last_reviewed_by: "admin (mock)",
    },
  }),
  normalizeMockMember({
    id: "m2",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "0898765432",
    status: "active",
    join_date: new Date().toISOString(),
    wallet_balance: 0,
    verified: false,
    created_at: new Date().toISOString(),
    kyc: {
      legal_name: "Jane Doe",
      date_of_birth: "1988-03-20",
      nationality: "US",
      residence_country: "TH",
      id_doc_type: "passport",
      id_doc_number: "AB1234567",
      id_doc_expires_at: "2028-01-15",
      kyc_status: "pending_review",
      address_line: "Sukhumvit Rd., Bangkok (mock)",
      pep_status: "unknown",
      sanctions_checked_at: null,
      sanctions_clear: null,
      risk_tier: "medium",
      risk_note: "รอตรวจเอกสารเพิ่ม (mock)",
      service_purpose: "ธุรกิจ",
      source_of_funds_note: "",
      kyc_tier: 1,
      terms_consent_at: new Date().toISOString(),
      internal_note: "",
      doc_front_placeholder: "pending",
      doc_back_placeholder: "none",
      last_reviewed_at: null,
      last_reviewed_by: "",
    },
  }),
];

export function getMembers(): MockMember[] {
  const list = read<MockMember[]>("members", seedMembers);
  const raw = list.length ? list : seedMembers;
  return raw.map((m) => normalizeMockMember(m));
}

export function setMembers(list: (Member | MockMember)[]) {
  const normalized: MockMember[] = list.map((m) =>
    "kyc" in m && (m as MockMember).kyc
      ? normalizeMockMember(m as MockMember)
      : normalizeMockMember({
          ...m,
          kyc: createDefaultKyc(m.name),
        }),
  );
  write("members", normalized);
}

const seedTxns: MockTxn[] = [
  {
    id: "txn_seed_1",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    member_id: "m1",
    member_name: "สมชาย ใจดี",
    currency_code: "USD",
    amount: 100,
    rate: 35.5,
    total_thb: 3550,
    staff_label: "แคชเชียร์ A",
    branch_id: "hq",
  },
  {
    id: "txn_seed_2",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    member_id: "m2",
    member_name: "Jane Doe",
    currency_code: "EUR",
    amount: 50,
    rate: 38.2,
    total_thb: 1910,
    staff_label: "แคชเชียร์ B",
    branch_id: "b2",
  },
  {
    id: "txn_seed_3",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    member_id: "m1",
    member_name: "สมชาย ใจดี",
    currency_code: "JPY",
    amount: 10000,
    rate: 0.215,
    total_thb: 2150,
    staff_label: "แคชเชียร์ A",
    branch_id: "b3",
  },
];

export function getTransactions(): MockTxn[] {
  const t = read<MockTxn[]>("transactions", []);
  return t.length ? t : seedTxns;
}

export function addTransaction(t: MockTxn) {
  const all = getTransactions();
  write("transactions", [t, ...all]);
}

export function getVisitCount(memberId: string): number {
  const v = read<Record<string, number>>("visits", {});
  return v[memberId] ?? 0;
}

export function incrementVisit(memberId: string) {
  const v = read<Record<string, number>>("visits", {});
  v[memberId] = (v[memberId] ?? 0) + 1;
  write("visits", v);
}

/** ลูกค้าซื้อเงินต่างประเทศ (จ่าย THB) / ขายเงินต่างประเทศ (รับ THB) */
export type BookingFxDirection = "buy_fx" | "sell_fx";

/** ผู้ใช้กรอกจำนวนเป็นสกุลเงินต่างประเทศหรือบาท */
export type BookingAmountInputUnit = "fx" | "thb";

export type CustomerBooking = {
  id: string;
  type: "queue" | "reserve";
  branch: string;
  /** อ้างอิงสาขา (เตรียม sync DB) */
  branch_id?: string;
  customer_email?: string;
  /** Supabase auth user id — preferred key for customer portal */
  customer_user_id?: string;
  member_name?: string;
  slot?: string;
  /** วันเวลานัดเข้าใช้บริการ (ISO) */
  pickup_date?: string;
  /** snapshot เวลาเปิดสาขา ณ ตอนจอง */
  branch_hours_snapshot?: string;
  fx_direction?: BookingFxDirection;
  amount_input_unit?: BookingAmountInputUnit;
  /** เรทอ้างอิง ณ เวลาจอง (ซื้อ/ขาย ตามตาราง) */
  reference_rate_buy?: number;
  reference_rate_sell?: number;
  currency_code?: string;
  currency_flag?: string;
  /** จำนวนเงินต่างประเทศ (หน่วยสกุลที่เลือก) */
  amount?: number;
  rate?: number;
  total_thb?: number;
  pickup_method?: "branch" | "wallet";
  slip_preview?: string;
  note?: string;
  /** รหัสยืนยันแสดงให้พนักงานที่สาขา (เช่น MXTH-20260411-AB12CD34) */
  confirmation_code?: string;
  status: BookingStatus;
  created_at: string;
};

function bookingsKeyForUser(userId: string) {
  return `bookings_uid_${userId}`;
}

export function getCustomerBookings(customerEmail: string): CustomerBooking[] {
  return read<CustomerBooking[]>(`bookings_${customerEmail}`, []);
}

export function getCustomerBookingsForUser(userId: string): CustomerBooking[] {
  return read<CustomerBooking[]>(bookingsKeyForUser(userId), []);
}

export function getAdminBookings(): CustomerBooking[] {
  return read<CustomerBooking[]>("admin_bookings", []);
}

export function addCustomerBooking(
  customerEmail: string,
  b: CustomerBooking,
) {
  const row: CustomerBooking = { ...b, customer_email: customerEmail };
  const cur = getCustomerBookings(customerEmail);
  write(`bookings_${customerEmail}`, [row, ...cur]);
  const admin = getAdminBookings();
  write("admin_bookings", [row, ...admin]);
}

export function addCustomerBookingForUser(
  userId: string,
  b: CustomerBooking,
  memberName?: string,
) {
  const row: CustomerBooking = {
    ...b,
    customer_user_id: userId,
    member_name: memberName ?? b.member_name,
  };
  const cur = getCustomerBookingsForUser(userId);
  write(bookingsKeyForUser(userId), [row, ...cur]);
  const admin = getAdminBookings();
  write("admin_bookings", [row, ...admin]);
}

export function patchCustomerBooking(
  id: string,
  patch: Partial<CustomerBooking>,
) {
  const admin = getAdminBookings();
  const idx = admin.findIndex((b) => b.id === id);
  if (idx < 0) return;
  const updated = { ...admin[idx], ...patch } as CustomerBooking;
  const next = [...admin];
  next[idx] = updated;
  write("admin_bookings", next);
  const em = updated.customer_email;
  if (em) {
    const cur = getCustomerBookings(em);
    write(
      `bookings_${em}`,
      cur.map((b) => (b.id === id ? updated : b)),
    );
  }
  const uid = updated.customer_user_id;
  if (uid) {
    const cur = getCustomerBookingsForUser(uid);
    write(
      bookingsKeyForUser(uid),
      cur.map((b) => (b.id === id ? updated : b)),
    );
  }
}

export function deleteMember(memberId: string) {
  const list = getMembers().filter((m) => m.id !== memberId);
  setMembers(list);
}

export function addMember(m: Member | MockMember) {
  const full: MockMember =
    "kyc" in m && m.kyc
      ? normalizeMockMember(m as MockMember)
      : normalizeMockMember({ ...m, kyc: createDefaultKyc(m.name) });
  const list = getMembers();
  setMembers([full, ...list]);
}

export type { MockMember } from "@/lib/mock/memberKyc";

export function newMockId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** รหัสอ้างอิงการจองสำหรับยืนยันกับพนักงาน */
export function newBookingReference(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  let suffix = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(4);
    crypto.getRandomValues(buf);
    suffix = Array.from(buf, (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  } else {
    suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  }
  return `MXTH-${ymd}-${suffix}`;
}

function transactionsKeyForUser(userId: string) {
  return `transactions_uid_${userId}`;
}

export function getTransactionsForUser(userId: string): MockTxn[] {
  const t = read<MockTxn[]>(transactionsKeyForUser(userId), []);
  return t;
}

/** Demo row so ประวัติแลกเปลี่ยน is not empty on first visit */
export function seedTransactionsForUserIfEmpty(
  userId: string,
  memberName: string,
) {
  const cur = getTransactionsForUser(userId);
  if (cur.length > 0) return;
  const seed: MockTxn[] = [
    {
      id: newMockId(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
      member_id: userId,
      member_name: memberName,
      currency_code: "USD",
      amount: 100,
      rate: 35.5,
      total_thb: 3550,
      staff_label: "แคชเชียร์ (ตัวอย่าง)",
      branch_id: "hq",
    },
  ];
  write(transactionsKeyForUser(userId), seed);
}
