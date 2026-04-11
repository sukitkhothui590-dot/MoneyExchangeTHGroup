import type { Booking } from "@/lib/types/database";
import type { CustomerBooking } from "@/lib/mock/store";

export function customerBookingToBooking(c: CustomerBooking): Booking {
  return {
    id: c.id,
    member_id: "mock",
    member_name:
      c.member_name ?? c.customer_email ?? c.customer_user_id ?? "—",
    currency_code: c.currency_code ?? "—",
    currency_flag: c.currency_flag ?? "🏦",
    amount: c.amount ?? 0,
    rate: c.rate ?? 0,
    total_thb: c.total_thb ?? 0,
    pickup_method: c.pickup_method ?? "branch",
    branch_name: c.branch,
    pickup_date: c.slot ?? null,
    status: c.status,
    slip_url: c.slip_preview ?? "",
    note: c.note ?? "",
    created_at: c.created_at,
  };
}
