/** รหัสอ้างอิงการจองสำหรับยืนยันกับพนักงาน — ใช้ได้ทั้ง server และ client */
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
