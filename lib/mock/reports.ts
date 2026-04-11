import type { MockTxn } from "@/lib/mock/store";

export type DailyAgg = { date: string; total_thb: number; count: number };

export function aggregateTransactionsByDay(txns: MockTxn[]): DailyAgg[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const t of txns) {
    const d = t.created_at.slice(0, 10);
    const cur = map.get(d) ?? { total: 0, count: 0 };
    cur.total += t.total_thb;
    cur.count += 1;
    map.set(d, cur);
  }
  return [...map.entries()]
    .map(([date, v]) => ({
      date,
      total_thb: Math.round(v.total * 100) / 100,
      count: v.count,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function sumThb(txns: MockTxn[]): number {
  return Math.round(txns.reduce((s, t) => s + t.total_thb, 0) * 100) / 100;
}

export type BranchAgg = {
  branch_id: string;
  total_thb: number;
  count: number;
};

export type CurrencyAgg = {
  currency_code: string;
  total_thb: number;
  count: number;
};

export function aggregateTransactionsByBranch(txns: MockTxn[]): BranchAgg[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const t of txns) {
    const cur = map.get(t.branch_id) ?? { total: 0, count: 0 };
    cur.total += t.total_thb;
    cur.count += 1;
    map.set(t.branch_id, cur);
  }
  return [...map.entries()]
    .map(([branch_id, v]) => ({
      branch_id,
      total_thb: Math.round(v.total * 100) / 100,
      count: v.count,
    }))
    .sort((a, b) => b.total_thb - a.total_thb);
}

export function aggregateTransactionsByCurrency(txns: MockTxn[]): CurrencyAgg[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const t of txns) {
    const cur = map.get(t.currency_code) ?? { total: 0, count: 0 };
    cur.total += t.total_thb;
    cur.count += 1;
    map.set(t.currency_code, cur);
  }
  return [...map.entries()]
    .map(([currency_code, v]) => ({
      currency_code,
      total_thb: Math.round(v.total * 100) / 100,
      count: v.count,
    }))
    .sort((a, b) => b.total_thb - a.total_thb);
}

export function uniqueMemberCount(txns: MockTxn[]): number {
  return new Set(txns.map((t) => t.member_id)).size;
}

export function avgThbPerTransaction(txns: MockTxn[]): number {
  if (!txns.length) return 0;
  return Math.round((sumThb(txns) / txns.length) * 100) / 100;
}
