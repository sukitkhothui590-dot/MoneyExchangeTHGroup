import type {
  BookingAmountInputUnit,
  BookingFxDirection,
} from "@/lib/mock/store";

/** buyRate = ร้านรับซื้อ FX / sellRate = ร้านขาย FX ให้ลูกค้า (THB ต่อ 1 หน่วย FX) */
export function computeBookingEstimates(
  direction: BookingFxDirection,
  inputUnit: BookingAmountInputUnit,
  rawAmount: number,
  buyRate: number,
  sellRate: number,
): { amountFx: number; totalThb: number; rateUsed: number } {
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return { amountFx: 0, totalThb: 0, rateUsed: 0 };
  }
  if (direction === "buy_fx") {
    if (inputUnit === "fx") {
      return {
        amountFx: rawAmount,
        totalThb: rawAmount * sellRate,
        rateUsed: sellRate,
      };
    }
    return {
      amountFx: rawAmount / sellRate,
      totalThb: rawAmount,
      rateUsed: sellRate,
    };
  }
  if (inputUnit === "fx") {
    return {
      amountFx: rawAmount,
      totalThb: rawAmount * buyRate,
      rateUsed: buyRate,
    };
  }
  return {
    amountFx: rawAmount / buyRate,
    totalThb: rawAmount,
    rateUsed: buyRate,
  };
}
