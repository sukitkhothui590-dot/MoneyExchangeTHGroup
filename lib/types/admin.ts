export type DeltaType = "PERCENT" | "ABSOLUTE";
export type ApplyTo = "BUY" | "SELL" | "BOTH";

export interface RateAdjustment {
  scope: "ALL" | string;
  deltaType: DeltaType;
  deltaValue: number;
  applyTo: ApplyTo;
}

export interface AdjustmentHistory {
  id: string;
  timestamp: string;
  scope: string;
  deltaType: DeltaType;
  deltaValue: number;
  applyTo: ApplyTo;
  appliedBy: string;
}

export interface AdminStats {
  lastUpdated: string;
  activeCurrencies: number;
  newsCount: number;
}
