import type { BranchIssueRow } from "@/lib/admin/branchIssueReport";

/** Demo rows for mock admin reports (USE_MOCK_DATA). */
export const MOCK_BRANCH_ISSUES: BranchIssueRow[] = [
  {
    id: "mock-iss-1",
    branch_id: "hq",
    summary: "เครื่องนับเงินขัดข้องช่วงบ่าย",
    detail: "แจ้งช่างแล้ว ใช้เครื่องสำรองจนซ่อมเสร็จ",
    severity: "medium",
    reported_at: "2026-04-10T06:30:00.000Z",
    reporter_name: "สมชาย (แอดมิน)",
  },
  {
    id: "mock-iss-2",
    branch_id: "b2",
    summary: "ลูกค้าแจ้งอัตราหน้าเว็บไม่ตรงกับหน้าร้าน",
    detail: "ตรวจสอบแล้วเป็นแคชเบราว์เซอร์ — แนะนำรีเฟรชและแสดงเรทวันนี้จาก POS",
    severity: "low",
    reported_at: "2026-04-12T03:15:00.000Z",
    reporter_name: "พนักงานทดสอบ",
  },
  {
    id: "mock-iss-3",
    branch_id: "b3",
    summary: "สลิปโอนลูกค้าหมดอายุ — ต้องขอสลิปใหม่",
    detail: "เกิด 2 ครั้งในวันเดียวกัน บันทึกคำเตือนในกระบวนการรับเงิน",
    severity: "high",
    reported_at: "2026-04-13T08:00:00.000Z",
    reporter_name: "demo@example.com",
  },
];
