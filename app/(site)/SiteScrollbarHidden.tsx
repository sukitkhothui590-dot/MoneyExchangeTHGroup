"use client";

import { useEffect } from "react";

const CLASS = "site-scrollbar-hidden";

/** ซ่อน scrollbar ที่ viewport ของหน้าบ้าน — ยังเลื่อนเมาส์/ทัช/คีย์บอร์ดได้ */
export function SiteScrollbarHidden() {
  useEffect(() => {
    document.documentElement.classList.add(CLASS);
    document.body.classList.add(CLASS);
    return () => {
      document.documentElement.classList.remove(CLASS);
      document.body.classList.remove(CLASS);
    };
  }, []);
  return null;
}
