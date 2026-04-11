"use client";

import { useState } from "react";
import type { BranchMarginEntry } from "@/lib/types/database";
import {
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import TwemojiFlag from "./TwemojiFlag";

interface BranchMarginTableProps {
  margins: BranchMarginEntry[];
  branchName: string;
  onUpdateMargin: (
    currencyCode: string,
    buyMargin: number,
    sellMargin: number,
  ) => void;
  pendingCurrencyCodes?: string[];
}

export default function BranchMarginTable({
  margins,
  branchName,
  onUpdateMargin,
  pendingCurrencyCodes = [],
}: BranchMarginTableProps) {
  const [search, setSearch] = useState("");
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    buy_margin_percent: "",
    sell_margin_percent: "",
  });

  const filtered = margins.filter(
    (m) =>
      m.currency_code.toLowerCase().includes(search.toLowerCase()) ||
      m.currency_name.toLowerCase().includes(search.toLowerCase()),
  );

  const startEdit = (m: BranchMarginEntry) => {
    setEditingCode(m.currency_code);
    setEditValues({
      buy_margin_percent: m.buy_margin_percent.toString(),
      sell_margin_percent: m.sell_margin_percent.toString(),
    });
  };

  const saveEdit = () => {
    if (editingCode === null) return;
    const buyVal = parseFloat(editValues.buy_margin_percent);
    const sellVal = parseFloat(editValues.sell_margin_percent);
    if (!isNaN(buyVal) && !isNaN(sellVal)) {
      onUpdateMargin(editingCode, buyVal, sellVal);
    }
    setEditingCode(null);
  };

  const cancelEdit = () => setEditingCode(null);

  const adjustMargin = (
    m: BranchMarginEntry,
    type: "buy" | "sell",
    delta: number,
  ) => {
    if (type === "buy") {
      const newMargin = Math.max(
        0,
        parseFloat((m.buy_margin_percent + delta).toFixed(2)),
      );
      onUpdateMargin(m.currency_code, newMargin, m.sell_margin_percent);
    } else {
      const newMargin = Math.max(
        0,
        parseFloat((m.sell_margin_percent + delta).toFixed(2)),
      );
      onUpdateMargin(m.currency_code, m.buy_margin_percent, newMargin);
    }
  };

  const getCalculatedRates = (margin: BranchMarginEntry) => {
    const precision = 1_000_000;
    const buy =
      Math.round(
        margin.global_buy_rate *
          (1 + (margin.buy_margin_percent - margin.global_buy_margin) / 100) *
          precision,
      ) / precision;
    const sell =
      Math.round(
        margin.global_sell_rate *
          (1 + (margin.sell_margin_percent - margin.global_sell_margin) / 100) *
          precision,
      ) / precision;

    return { buy, sell };
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="ค้นหาสกุลเงิน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
          />
        </div>
        <p className="text-sm text-muted hidden sm:block">
          มาร์จิ้นเฉพาะสาขา:{" "}
          <span className="font-medium text-foreground">{branchName}</span>
        </p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-5 py-3 font-medium text-muted">
                  สกุลเงิน
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  มาร์จิ้นซื้อ %
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  มาร์จิ้นขาย %
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  ค่ากลาง (มาร์จิ้น)
                </th>
                <th className="text-right px-5 py-3 font-medium text-muted">
                  ซื้อสาขา
                </th>
                <th className="text-right px-5 py-3 font-medium text-muted">
                  ขายสาขา
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  สถานะ
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((margin) => {
                const isEditing = editingCode === margin.currency_code;
                const calculated = getCalculatedRates(margin);
                const isPending = pendingCurrencyCodes.includes(
                  margin.currency_code,
                );

                return (
                  <tr
                    key={margin.currency_code}
                    className={`border-b border-border last:border-b-0 transition-colors ${
                      isEditing
                        ? "bg-brand-subtle"
                        : isPending
                          ? "bg-surface/80"
                          : "hover:bg-surface/60"
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <TwemojiFlag emoji={margin.currency_flag} />
                        <div>
                          <span className="font-semibold text-foreground">
                            {margin.currency_code}
                          </span>
                          <p className="text-xs text-muted">
                            {margin.currency_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Buy Margin */}
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.buy_margin_percent}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                buy_margin_percent: e.target.value,
                              })
                            }
                            className="w-20 h-8 px-2 text-center rounded border border-brand bg-white text-sm text-foreground"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustMargin(margin, "buy", -0.1)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-14 text-center font-mono text-sm font-medium text-foreground">
                            {margin.buy_margin_percent.toFixed(2)}%
                          </span>
                          <button
                            onClick={() => adjustMargin(margin, "buy", 0.1)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Sell Margin */}
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.sell_margin_percent}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                sell_margin_percent: e.target.value,
                              })
                            }
                            className="w-20 h-8 px-2 text-center rounded border border-brand bg-white text-sm text-foreground"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustMargin(margin, "sell", -0.1)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-14 text-center font-mono text-sm font-medium text-foreground">
                            {margin.sell_margin_percent.toFixed(2)}%
                          </span>
                          <button
                            onClick={() => adjustMargin(margin, "sell", 0.1)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs text-muted font-mono">
                        {margin.global_buy_margin.toFixed(2)}% /{" "}
                        {margin.global_sell_margin.toFixed(2)}%
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono text-foreground">
                        {calculated.buy.toFixed(4)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono text-foreground">
                        {calculated.sell.toFixed(4)}
                      </span>
                    </td>

                    {/* Override status */}
                    <td className="px-5 py-3.5 text-center">
                      {margin.is_override ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          กำหนดเอง
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                          ใช้ค่ากลาง
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              disabled={isPending}
                              className="h-7 px-3 bg-brand text-white text-xs font-medium rounded-md hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isPending}
                              className="h-7 px-3 border border-border text-xs font-medium text-muted rounded-md hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ยกเลิก
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(margin)}
                            disabled={isPending}
                            className="h-7 px-3 border border-border text-xs font-medium text-muted rounded-md hover:text-brand hover:border-brand transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            แก้ไข
                          </button>
                        )}
                        </div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                            กำลังบันทึก...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted">
                    ไม่พบสกุลเงินที่ค้นหา &ldquo;{search}&rdquo;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
