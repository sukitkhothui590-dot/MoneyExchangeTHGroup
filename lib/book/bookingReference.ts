/** รหัสอ้างอิงการจองสำหรับยืนยันกับพนักงาน — ใช้ได้ทั้ง server และ client */

function ymdCompact(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** สร้างรหัสทางการ เช่น BK-20260417-482915 (วันที่ + เลขสุ่ม 6 หลัก ลดโอกาสชนกันในวันเดียวกัน) */
export function newBookingReference(): string {
  const ymd = ymdCompact(new Date());
  let n = 100000 + Math.floor(Math.random() * 900000);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(4);
    crypto.getRandomValues(buf);
    const v =
      (buf[0] << 24) | (buf[1] << 16) | (buf[2] << 8) | buf[3];
    n = 100000 + (Math.abs(v) % 900000);
  }
  return `BK-${ymd}-${String(n)}`;
}

/**
 * แสดงรหัสอ้างอิงให้ผู้ใช้ / แอดมิน — ใช้ confirmation_code จาก DB ถ้ามี;
 * ถ้าไม่มี (ข้อมูลเก่า) ใช้รูปแบบ BK-YYYYMMDD-NNNNNN (เลข 6 หลักจาก UUID) แทนการโชว์ UUID เต็ม
 */
export function bookingDisplayReference(b: {
  confirmation_code?: string | null;
  id: string;
  created_at: string;
}): string {
  const c = b.confirmation_code?.trim();
  if (c) return c;
  const d = new Date(b.created_at);
  const ymd = ymdCompact(Number.isNaN(d.getTime()) ? new Date() : d);
  const hex = b.id.replace(/-/g, "");
  let suffix = "000000";
  if (hex.length >= 12) {
    const n = parseInt(hex.slice(-12), 16);
    if (Number.isFinite(n)) {
      suffix = String(100000 + (Math.abs(n) % 900000));
    }
  }
  return `BK-${ymd}-${suffix}`;
}

/** แสดงเลขที่ธุรกรรมแบบทางการ TXN-YYYYMMDD-NNNNNN (จากวันที่ + ส่วนท้ายจาก UUID) */
export function transactionDisplayReference(t: {
  id: string;
  created_at: string;
}): string {
  const d = new Date(t.created_at);
  const ymd = ymdCompact(Number.isNaN(d.getTime()) ? new Date() : d);
  const hex = t.id.replace(/-/g, "");
  let suffix = "000000";
  if (hex.length >= 12) {
    const n = parseInt(hex.slice(-12), 16);
    if (Number.isFinite(n)) {
      suffix = String(100000 + (Math.abs(n) % 900000));
    }
  }
  return `TXN-${ymd}-${suffix}`;
}
