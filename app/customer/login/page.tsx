import { Suspense } from "react";
import type { Metadata } from "next";
import CustomerAuthForm from "@/components/auth/CustomerAuthForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | MoneyExchangeTHGroup",
  description: "เข้าสู่ระบบสมาชิก MoneyExchangeTHGroup",
};

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[420px] w-full flex items-center justify-center text-surface-500 text-sm">
          …
        </div>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center py-10 sm:py-12 min-h-screen px-4">
        <CustomerAuthForm initialView="login" />
      </div>
    </Suspense>
  );
}
