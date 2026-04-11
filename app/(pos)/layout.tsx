import Link from "next/link";
import { PosMockAuthProvider } from "@/lib/context/PosMockAuth";

export default function PosGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PosMockAuthProvider>
      <div className="min-h-screen bg-surface text-foreground overflow-x-clip">
        <header className="border-b border-border bg-white sticky top-0 z-10">
          <div className="mx-auto max-w-2xl w-full min-w-0 px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-foreground truncate">
              POS
            </span>
            <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-shrink-0">
              <Link
                href="/pos/dashboard"
                className="text-muted hover:text-brand whitespace-nowrap"
              >
                หน้าหลัก
              </Link>
              <Link
                href="/pos/exchange"
                className="text-muted hover:text-brand whitespace-nowrap"
              >
                แลกเงิน
              </Link>
              <Link
                href="/pos/queue"
                className="text-muted hover:text-brand whitespace-nowrap"
              >
                คิว
              </Link>
              <Link
                href="/pos/history"
                className="text-muted hover:text-brand whitespace-nowrap"
              >
                ประวัติ
              </Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-2xl w-full min-w-0 px-4 py-6">{children}</div>
      </div>
    </PosMockAuthProvider>
  );
}
