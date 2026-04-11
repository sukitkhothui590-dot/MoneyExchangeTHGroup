/** ตรวจว่าเป็นอีเมลแบบง่าย (ใช้แยกจากเบอร์ไทยตอนล็อกอิน) */
export function isEmailLike(input: string): boolean {
  const s = input.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}
