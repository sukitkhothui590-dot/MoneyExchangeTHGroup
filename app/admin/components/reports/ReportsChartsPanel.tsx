"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BranchAgg, CurrencyAgg, DailyAgg } from "@/lib/mock/reports";
import type { KycStatus } from "@/lib/mock/memberKyc";
import ReportSectionCard from "../ReportSectionCard";

const BRAND = "#922427";
const BRAND_MID = "#c44a4e";
const PIE_COLORS = [
  BRAND,
  BRAND_MID,
  "#15803d",
  "#ca8a04",
  "#6b7280",
  "#b84a4d",
  "#991b1b",
];

type ChartLabels = {
  sectionTitle: string;
  dailyThb: string;
  currencyShare: string;
  branchThb: string;
  kycMembers: string;
  legendThb: string;
  legendCount: string;
  empty: string;
};

type Props = {
  daily: DailyAgg[];
  byBranch: BranchAgg[];
  byCurrency: CurrencyAgg[];
  kycRows: { status: KycStatus; count: number }[];
  branchLabel: (id: string) => string;
  kycLabel: (s: KycStatus) => string;
  dateLocale: string;
  numLocale: string;
  labels: ChartLabels;
};

function formatThbTooltip(v: number, locale: string) {
  return `฿${v.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
}

export default function ReportsChartsPanel({
  daily,
  byBranch,
  byCurrency,
  kycRows,
  branchLabel,
  kycLabel,
  dateLocale,
  numLocale,
  labels,
}: Props) {
  const dailySorted = useMemo(() => {
    return [...daily].sort((a, b) => a.date.localeCompare(b.date));
  }, [daily]);

  const dailyData = useMemo(() => {
    return dailySorted.map((d) => ({
      label: new Date(d.date + "T12:00:00").toLocaleDateString(dateLocale, {
        month: "short",
        day: "numeric",
      }),
      thb: d.total_thb,
      count: d.count,
    }));
  }, [dailySorted, dateLocale]);

  const branchData = useMemo(() => {
    return [...byBranch]
      .sort((a, b) => b.total_thb - a.total_thb)
      .map((b) => ({
        name:
          branchLabel(b.branch_id).length > 22
            ? `${branchLabel(b.branch_id).slice(0, 20)}…`
            : branchLabel(b.branch_id),
        thb: b.total_thb,
        count: b.count,
      }));
  }, [byBranch, branchLabel]);

  const currencyPieData = useMemo(() => {
    return byCurrency
      .filter((c) => c.total_thb > 0)
      .map((c) => ({
        name: c.currency_code,
        value: c.total_thb,
      }));
  }, [byCurrency]);

  const kycBarData = useMemo(() => {
    return kycRows
      .filter((r) => r.count > 0)
      .map((r) => ({
        name: kycLabel(r.status),
        count: r.count,
      }));
  }, [kycRows, kycLabel]);

  const branchChartHeight = Math.min(
    420,
    Math.max(220, branchData.length * 44 + 80),
  );

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.06)",
    fontSize: "12px",
  };

  const emptyBlock = (
    <div className="flex min-h-[220px] items-center justify-center px-4 py-8 text-sm text-muted">
      {labels.empty}
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {labels.sectionTitle}
      </h3>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ReportSectionCard title={labels.dailyThb}>
            {dailyData.length === 0 ? (
              emptyBlock
            ) : (
              <div className="h-[300px] w-full px-2 pb-4 pt-2 sm:px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted)" }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                      }
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const p = payload[0]
                          .payload as {
                          label: string;
                          thb: number;
                          count: number;
                        };
                        return (
                          <div className="rounded-xl border border-border/80 bg-white px-3 py-2 text-xs shadow-lg">
                            <p className="font-semibold text-foreground">
                              {p.label}
                            </p>
                            <p className="text-foreground">
                              {formatThbTooltip(p.thb, numLocale)}
                            </p>
                            <p className="text-muted">
                              {labels.legendCount}: {p.count}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="thb"
                      name={labels.legendThb}
                      fill={BRAND}
                      radius={[8, 8, 0, 0]}
                      maxBarSize={52}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ReportSectionCard>
        </div>

        <div className="xl:col-span-1">
          <ReportSectionCard title={labels.currencyShare}>
            {currencyPieData.length === 0 ? (
              emptyBlock
            ) : (
              <div className="h-[300px] w-full px-2 pb-4 pt-2 sm:px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {currencyPieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          stroke="var(--background)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const raw = payload[0].value;
                        const n =
                          typeof raw === "number" ? raw : Number(raw);
                        if (!Number.isFinite(n)) return null;
                        return (
                          <div
                            className="rounded-xl border border-border/80 bg-white px-3 py-2 text-xs shadow-lg"
                            style={tooltipStyle}
                          >
                            {formatThbTooltip(n, numLocale)}
                          </div>
                        );
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ReportSectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportSectionCard title={labels.kycMembers}>
          {kycBarData.length === 0 ? (
            emptyBlock
          ) : (
            <div className="h-[260px] w-full px-2 pb-4 pt-2 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kycBarData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={128}
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="count"
                    fill={BRAND}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ReportSectionCard>

        <ReportSectionCard title={labels.branchThb}>
          {branchData.length === 0 ? (
            emptyBlock
          ) : (
            <div
              className="w-full px-2 pb-4 pt-2 sm:px-4"
              style={{ height: branchChartHeight }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={branchData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={108}
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const raw = payload[0].value;
                      const n =
                        typeof raw === "number" ? raw : Number(raw);
                      if (!Number.isFinite(n)) return null;
                      return (
                        <div
                          className="rounded-xl border border-border/80 bg-white px-3 py-2 text-xs shadow-lg"
                          style={tooltipStyle}
                        >
                          {formatThbTooltip(n, numLocale)}
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="thb"
                    fill={BRAND_MID}
                    radius={[0, 8, 8, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ReportSectionCard>
      </div>
    </div>
  );
}
