"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BanknotesIcon,
  ChartBarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ClockIcon,
  HomeModernIcon,
  IdentificationIcon,
  QueueListIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import { usePosSession } from "@/lib/context/PosSessionContext";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof HomeModernIcon;
  /** แสดงเฉพาะผู้ดูแลระบบ — พนักงานหน้าร้านไม่เห็น */
  adminOnly?: boolean;
};

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/pos/dashboard", label: "แดชบอร์ด", Icon: HomeModernIcon },
  { href: "/pos/exchange", label: "แลกเงิน", Icon: BanknotesIcon },
  { href: "/pos/identity", label: "ยืนยันตัวตน", Icon: IdentificationIcon },
  { href: "/pos/queue", label: "คิว / จอง", Icon: QueueListIcon },
  {
    href: "/pos/customer",
    label: "ลูกค้า",
    Icon: UserGroupIcon,
    adminOnly: true,
  },
  { href: "/pos/history", label: "ประวัติ", Icon: ClockIcon },
  { href: "/pos/reports", label: "รายงาน", Icon: ChartBarIcon },
];

function headingFor(p: string) {
  if (p.startsWith("/pos/kyc"))
    return { b: ["POS", "KYC"], t: "ตรวจสอบลูกค้า", s: "ขั้นตอนและเอกสาร (จำลอง)" };
  if (p === "/pos/customer" || p === "/pos/customer/")
    return {
      b: ["งานหน้าร้าน", "ลูกค้า"],
      t: "ค้นหาลูกค้า",
      s: "รายชื่อและค้นหาสมาชิก (ผู้ดูแลระบบ)",
    };
  if (p.startsWith("/pos/customer/"))
    return {
      b: ["POS", "ลูกค้า"],
      t: "รายละเอียดสมาชิก",
      s: "ข้อมูลและจำนวนครั้งเข้าใช้บริการ",
    };
  const m: Record<string, { b: string[]; t: string; s: string }> = {
    "/pos/dashboard": {
      b: ["ภาพรวม", "แดชบอร์ด"],
      t: "แดชบอร์ด",
      s: "ยอดวันนี้ คิว สรุปสกุลเงิน และธุรกรรมล่าสุด",
    },
    "/pos/exchange": {
      b: ["งานหน้าร้าน", "แลกเงิน"],
      t: "แลกเงิน",
      s: "ค้นหาสมาชิก Walk-in และบันทึกธุรกรรม",
    },
    "/pos/identity": {
      b: ["งานหน้าร้าน", "ยืนยันตัวตน"],
      t: "ยืนยันตัวตน",
      s: "แสกนพาสปอร์ต (MRZ) / บัตร ปชช. ด้วยกล้อง OCR หรือใส่ข้อมูลเอง — ค้นหาหรือสมัครสมาชิก",
    },
    "/pos/queue": { b: ["งานหน้าร้าน", "คิว"], t: "คิว / การจอง", s: "รายการของสาขาที่เลือก เรียงล่าสุดก่อน" },
    "/pos/history": { b: ["รายงาน", "ประวัติ"], t: "ประวัติธุรกรรม", s: "ธุรกรรม POS ตามสาขา" },
    "/pos/reports": {
      b: ["รายงาน", "สรุป"],
      t: "รายงานสรุป",
      s: "ยอดรวมตามสกุลเงิน · แจ้งปัญหาสาขา",
    },
  };
  return m[p] ?? { b: ["POS"], t: "POS", s: "" };
}

export function PosChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    branch,
    setBranch,
    userEmail,
    userDisplayName,
    ready,
    clearBranch,
    posAccess,
  } = usePosSession();

  const navLinks = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) => !item.adminOnly || posAccess?.role === "admin",
      ),
    [posAccess?.role],
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [sidebarPrefsReady, setSidebarPrefsReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [incomingCount, setIncomingCount] = useState(0);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const knownBookingIdsRef = useRef<Set<string>>(new Set());
  const bootstrappedRef = useRef(false);
  const pollingRef = useRef(false);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    if (typeof window !== "undefined") {
      window.addEventListener("online", on);
      window.addEventListener("offline", off);
      return () => {
        window.removeEventListener("online", on);
        window.removeEventListener("offline", off);
      };
    }
  }, []);

  const hideChrome = pathname === "/pos/login";
  const h = useMemo(() => headingFor(pathname), [pathname]);
  const greetName = userDisplayName?.trim() || userEmail?.split("@")[0] || "พนักงาน";
  const dateLine = useMemo(
    () =>
      new Date().toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearBranch();
    setMobileOpen(false);
    router.push("/pos/login");
    router.refresh();
  }, [clearBranch, router]);

  const playFallbackBeep = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
      window.setTimeout(() => void ctx.close(), 260);
    } catch {
      /* ignore audio failures */
    }
  }, []);

  const playIncomingTone = useCallback(() => {
    if (!soundEnabled) return;
    const audio = alertAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => playFallbackBeep());
      return;
    }
    playFallbackBeep();
  }, [soundEnabled, playFallbackBeep]);

  const enableSound = useCallback(() => {
    setSoundEnabled(true);
    const audio = alertAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => playFallbackBeep());
    } else {
      playFallbackBeep();
    }
  }, [playFallbackBeep]);

  const pollIncomingBookings = useCallback(async () => {
    if (!ready || !userEmail || !branch?.id || pollingRef.current) return;
    if (!notifyEnabled) return;
    if (pathname === "/pos/queue" || pathname === "/pos/login") return;
    pollingRef.current = true;
    try {
      const res = await fetch(
        `/api/bookings?branchId=${encodeURIComponent(branch.id)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const json = await res.json();
      const rows = (json.data ?? []) as { id: string }[];
      const nextIds = new Set(rows.map((x) => x.id));

      if (!bootstrappedRef.current) {
        knownBookingIdsRef.current = nextIds;
        bootstrappedRef.current = true;
        return;
      }
      const newCount = rows.filter((x) => !knownBookingIdsRef.current.has(x.id)).length;
      if (newCount > 0) {
        setIncomingCount((prev) => prev + newCount);
        playIncomingTone();
      }
      knownBookingIdsRef.current = nextIds;
    } finally {
      pollingRef.current = false;
    }
  }, [ready, userEmail, branch?.id, notifyEnabled, pathname, playIncomingTone]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const audio = new Audio("/sounds/booking-alert.mp3");
    audio.preload = "auto";
    alertAudioRef.current = audio;
    return () => {
      alertAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    try {
      const notifySaved = window.localStorage.getItem("pos_queue_notify_enabled");
      const saved = window.localStorage.getItem("pos_queue_sound_enabled");
      setNotifyEnabled(notifySaved !== "0");
      setSoundEnabled(saved === "1");
    } catch {
      /* ignore */
    }
    setPrefsHydrated(true);
  }, []);

  useEffect(() => {
    try {
      const c = window.localStorage.getItem("pos_sidebar_desktop_collapsed");
      setDesktopCollapsed(c === "1");
    } catch {
      /* ignore */
    }
    setSidebarPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!sidebarPrefsReady) return;
    try {
      window.localStorage.setItem(
        "pos_sidebar_desktop_collapsed",
        desktopCollapsed ? "1" : "0",
      );
    } catch {
      /* ignore */
    }
  }, [desktopCollapsed, sidebarPrefsReady]);

  useEffect(() => {
    if (!prefsHydrated) return;
    try {
      window.localStorage.setItem(
        "pos_queue_notify_enabled",
        notifyEnabled ? "1" : "0",
      );
      window.localStorage.setItem(
        "pos_queue_sound_enabled",
        soundEnabled ? "1" : "0",
      );
    } catch {
      /* ignore */
    }
  }, [prefsHydrated, notifyEnabled, soundEnabled]);

  useEffect(() => {
    if (!ready || !userEmail || !branch?.id) {
      bootstrappedRef.current = false;
      knownBookingIdsRef.current = new Set();
      setIncomingCount(0);
      return;
    }
    if (!notifyEnabled) {
      bootstrappedRef.current = false;
      knownBookingIdsRef.current = new Set();
      setIncomingCount(0);
      return;
    }
    bootstrappedRef.current = false;
    knownBookingIdsRef.current = new Set();
    void pollIncomingBookings();
    const id = window.setInterval(() => {
      void pollIncomingBookings();
    }, 12000);
    return () => window.clearInterval(id);
  }, [ready, userEmail, branch?.id, notifyEnabled, pollIncomingBookings]);

  if (hideChrome) return <>{children}</>;

  const NavInner = ({
    collapsed = false,
    onNavigate,
  }: {
    collapsed?: boolean;
    onNavigate?: () => void;
  }) => (
    <>
      <div
        className={[
          "border-b border-white/15 shrink-0",
          collapsed ? "px-2 pt-4 pb-3" : "px-4 pt-6 pb-4",
        ].join(" ")}
      >
        <Link
          href="/pos/dashboard"
          onClick={onNavigate}
          title={collapsed ? "แดชบอร์ด" : undefined}
          className={[
            "flex min-w-0",
            collapsed ? "flex-col items-center justify-center gap-0" : "items-center gap-2",
          ].join(" ")}
        >
          <div className="h-9 w-9 rounded-lg bg-white text-blue-900 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-black/10">
            POS
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Money Exchange</p>
              <p className="text-[11px] text-blue-200/90 truncate">เคาน์เตอร์</p>
            </div>
          ) : null}
        </Link>
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-4 space-y-1">
        {!collapsed ? (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-300/90">
            เมนูหลัก
          </p>
        ) : (
          <div className="h-px w-8 mx-auto mb-2 bg-white/15 rounded-full" aria-hidden />
        )}
        {navLinks.map(({ href, label, Icon }) => {
          const isActive =
            href === "/pos/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              onClick={onNavigate}
              className={[
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-white text-blue-900 border border-white shadow-md shadow-black/10"
                  : "text-blue-100/95 hover:bg-white hover:text-blue-900 border border-transparent",
              ].join(" ")}
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              {!collapsed ? label : null}
            </Link>
          );
        })}
      </nav>
      <div
        className={[
          "border-t border-white/15 shrink-0",
          collapsed ? "p-2 flex flex-col items-center gap-2" : "p-3",
        ].join(" ")}
      >
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white shadow-sm p-2.5">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-800 shrink-0">
                {(greetName[0] ?? "?").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-900 truncate">{greetName}</p>
                <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-white border border-white/35 hover:bg-white/10 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </>
        ) : (
          <>
            <div
              className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-800 shrink-0"
              title={greetName}
            >
              {(greetName[0] ?? "?").toUpperCase()}
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              title="ออกจากระบบ"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white border border-white/35 hover:bg-white/10 transition-colors"
              aria-label="ออกจากระบบ"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden w-full">
      <aside
        className={[
          "hidden lg:flex shrink-0 h-full min-h-0 flex-col border-r border-blue-950/50 bg-blue-900 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.35)] transition-[width] duration-200 ease-out overflow-hidden",
          desktopCollapsed ? "w-16" : "w-[260px]",
        ].join(" ")}
      >
        <NavInner collapsed={desktopCollapsed} />
      </aside>
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          onClick={() => setMobileOpen(false)}
          aria-label="ปิดเมนู"
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-blue-900 shadow-xl flex flex-col min-h-0 transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-end p-2 border-b border-white/15 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg text-blue-100 hover:bg-white/10"
              aria-label="ปิด"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <NavInner onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {!online ? (
          <div
            role="status"
            className="shrink-0 bg-amber-50 border-b border-amber-200 text-amber-950 text-center text-xs py-2 px-4"
          >
            ออฟไลน์ — ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตก่อนบันทึกธุรกรรม
          </div>
        ) : null}
        <header className="shrink-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-blue-100/90 bg-white/95 backdrop-blur-md px-4 py-3 lg:px-8 shadow-sm shadow-blue-950/5">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-blue-800 hover:bg-blue-50 -ml-1 shrink-0"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl text-slate-600 hover:text-blue-900 hover:bg-blue-50 shrink-0 -ml-1"
            onClick={() => setDesktopCollapsed((v) => !v)}
            aria-label={desktopCollapsed ? "ขยายเมนูด้านข้าง" : "ย่อเมนูด้านข้าง (แสดงไอคอน)"}
            title={desktopCollapsed ? "ขยายเมนู" : "ย่อเป็นไอคอน"}
          >
            {desktopCollapsed ? (
              <ChevronDoubleRightIcon className="w-5 h-5" />
            ) : (
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            )}
          </button>
          <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
            <p className="text-[11px] text-blue-600/80 truncate">{h.b.join(" / ")}</p>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight truncate">{h.t}</h1>
            {h.s ? <p className="text-xs text-slate-500 mt-0.5 truncate">{h.s}</p> : null}
          </div>
          {ready && branch && posAccess && posAccess.allowedBranches.length > 1 ? (
            <div className="w-full sm:w-auto sm:min-w-[200px] max-w-md shrink-0 flex flex-col gap-1">
              <label className="text-[10px] font-medium uppercase text-slate-500 block">
                สาขาที่ทำงาน
              </label>
              <select
                value={branch.id}
                onChange={(e) => {
                  const b = posAccess.allowedBranches.find((x) => x.id === e.target.value);
                  if (b) setBranch(b);
                }}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5"
                aria-label="เลือกสาขาที่ทำงาน"
              >
                {posAccess.allowedBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name_th}
                  </option>
                ))}
              </select>
            </div>
          ) : ready && branch ? (
            <div className="w-full sm:w-auto sm:min-w-[160px] max-w-md shrink-0 flex flex-col gap-0.5">
              <p className="text-[10px] font-medium uppercase text-slate-500">สาขาที่ทำงาน</p>
              <p className="text-xs font-semibold text-slate-900 truncate">{branch.name_th}</p>
            </div>
          ) : ready ? (
            <p className="w-full sm:w-auto text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 shrink-0 max-w-md">
              เลือกสาขาตอนเข้าสู่ระบบ
            </p>
          ) : null}
          <div className="hidden sm:block text-right shrink-0 sm:ml-auto">
            <p className="text-sm text-slate-800">
              สวัสดี, <span className="font-semibold text-blue-900">{greetName}</span>
            </p>
            <p className="text-[11px] text-slate-500">{dateLine}</p>
          </div>
        </header>
        {incomingCount > 0 ? (
          <div className="shrink-0 px-4 lg:px-8 pt-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-blue-900">
                มีการจองใหม่เข้า {incomingCount} รายการ
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIncomingCount(0);
                    router.push("/pos/queue");
                  }}
                  className="h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  ไปหน้าคิว
                </button>
                <button
                  type="button"
                  onClick={() => setIncomingCount(0)}
                  className="h-8 px-3 rounded-lg border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-white"
                >
                  ปิดแจ้งเตือน
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-6 lg:px-8 lg:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
