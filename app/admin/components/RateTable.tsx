"use client";

import { useState } from "react";
import type { Currency } from "@/lib/types/database";
import {
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
  Bars3Icon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import TwemojiFlag from "./TwemojiFlag";

interface RateTableProps {
  currencies: Currency[];
  onUpdateCurrency: (index: number, updated: Currency) => void;
  onDeleteCurrency?: (code: string) => void;
  onReorder?: (reordered: Currency[]) => void;
  pendingCurrencyCodes?: string[];
}

export default function RateTable({
  currencies,
  onUpdateCurrency,
  onDeleteCurrency,
  onReorder,
  pendingCurrencyCodes = [],
}: RateTableProps) {
  const [search, setSearch] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({
    buy_rate: "",
    sell_rate: "",
    buy_margin_percent: "",
    sell_margin_percent: "",
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Currency | null>(null);

  const isDraggable = !search && onReorder;

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex || !onReorder) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...currencies];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onReorder(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const filtered = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const startEdit = (index: number) => {
    const c = currencies[index];
    setEditingIndex(index);
    setEditValues({
      buy_rate: c.buy_rate.toString(),
      sell_rate: c.sell_rate.toString(),
      buy_margin_percent: c.buy_margin_percent.toString(),
      sell_margin_percent: c.sell_margin_percent.toString(),
    });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const c = currencies[editingIndex];

    const parsedBuyRate = parseFloat(editValues.buy_rate);
    const parsedSellRate = parseFloat(editValues.sell_rate);
    const parsedBuyMargin = parseFloat(editValues.buy_margin_percent);
    const parsedSellMargin = parseFloat(editValues.sell_margin_percent);

    const nextBuyMargin = !isNaN(parsedBuyMargin)
      ? parsedBuyMargin
      : c.buy_margin_percent;
    const nextSellMargin = !isNaN(parsedSellMargin)
      ? parsedSellMargin
      : c.sell_margin_percent;

    const buyRateExplicit =
      !isNaN(parsedBuyRate) && Math.abs(parsedBuyRate - c.buy_rate) > 1e-9;
    const sellRateExplicit =
      !isNaN(parsedSellRate) && Math.abs(parsedSellRate - c.sell_rate) > 1e-9;

    const buyMarginChanged =
      Math.abs(nextBuyMargin - c.buy_margin_percent) > 1e-9;
    const sellMarginChanged =
      Math.abs(nextSellMargin - c.sell_margin_percent) > 1e-9;

    const precision = 1_000_000;
    let finalBuyRate = !isNaN(parsedBuyRate) ? parsedBuyRate : c.buy_rate;
    let finalSellRate = !isNaN(parsedSellRate) ? parsedSellRate : c.sell_rate;

    if (!buyRateExplicit && buyMarginChanged) {
      finalBuyRate =
        Math.round(
          c.buy_rate *
            (1 + (nextBuyMargin - c.buy_margin_percent) / 100) *
            precision,
        ) / precision;
    }
    if (!sellRateExplicit && sellMarginChanged) {
      finalSellRate =
        Math.round(
          c.sell_rate *
            (1 + (nextSellMargin - c.sell_margin_percent) / 100) *
            precision,
        ) / precision;
    }

    if (finalBuyRate >= finalSellRate) {
      window.alert("ราคารับซื้อต้องน้อยกว่าราคาขายออก");
      return;
    }

    onUpdateCurrency(editingIndex, {
      ...c,
      buy_rate: finalBuyRate,
      sell_rate: finalSellRate,
      buy_margin_percent: nextBuyMargin,
      sell_margin_percent: nextSellMargin,
    });
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const adjustMargin = (index: number, type: "buy" | "sell", delta: number) => {
    const c = currencies[index];
    const P = 1_000_000;
    if (type === "buy") {
      const newMargin = Math.max(
        0,
        parseFloat((c.buy_margin_percent + delta).toFixed(2)),
      );
      const newRate =
        Math.round(
          c.buy_rate *
            (1 + (newMargin - c.buy_margin_percent) / 100) *
            P,
        ) / P;
      onUpdateCurrency(index, {
        ...c,
        buy_margin_percent: newMargin,
        buy_rate: newRate,
      });
    } else {
      const newMargin = Math.max(
        0,
        parseFloat((c.sell_margin_percent + delta).toFixed(2)),
      );
      const newRate =
        Math.round(
          c.sell_rate *
            (1 + (newMargin - c.sell_margin_percent) / 100) *
            P,
        ) / P;
      onUpdateCurrency(index, {
        ...c,
        sell_margin_percent: newMargin,
        sell_rate: newRate,
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
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
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                {isDraggable && (
                  <th className="w-10 px-2 py-3 font-medium text-muted"></th>
                )}
                <th className="text-left px-5 py-3 font-medium text-muted">
                  สกุลเงิน
                </th>
                <th className="text-right px-5 py-3 font-medium text-muted">
                  ราคารับซื้อ
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  มาร์จิ้นซื้อ %
                </th>
                <th className="text-right px-5 py-3 font-medium text-muted">
                  ราคาขายออก
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  มาร์จิ้นขาย %
                </th>
                <th className="text-left px-5 py-3 font-medium text-muted">
                  อัปเดตล่าสุด
                </th>
                <th className="text-center px-5 py-3 font-medium text-muted">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((currency) => {
                const realIndex = currencies.findIndex(
                  (c) => c.code === currency.code,
                );
                const isEditing = editingIndex === realIndex;
                const isDragging = dragIndex === realIndex;
                const isDragOver = dragOverIndex === realIndex;
                const isPending = pendingCurrencyCodes.includes(currency.code);

                return (
                  <tr
                    key={currency.code}
                    draggable={isDraggable ? true : undefined}
                    onDragStart={() =>
                      isDraggable && handleDragStart(realIndex)
                    }
                    onDragOver={(e) =>
                      isDraggable && handleDragOver(e, realIndex)
                    }
                    onDrop={(e) => isDraggable && handleDrop(e, realIndex)}
                    onDragEnd={handleDragEnd}
                    className={`border-b border-border last:border-b-0 transition-colors ${
                      isEditing
                        ? "bg-brand-subtle"
                        : isPending
                          ? "bg-surface/80"
                        : isDragging
                          ? "opacity-40 bg-surface"
                          : isDragOver
                            ? "bg-brand-subtle/40 border-t-2 border-t-brand"
                            : "hover:bg-surface/60"
                    }`}
                  >
                    {isDraggable && (
                      <td className="w-10 px-2 py-3.5 cursor-grab active:cursor-grabbing">
                        <Bars3Icon className="w-4 h-4 text-muted" />
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <TwemojiFlag
                          emoji={currency.flag}
                          className="hidden sm:inline-flex"
                        />
                        <div>
                          <span className="font-semibold text-foreground">
                            {currency.code}
                          </span>
                          <p className="text-xs text-muted">{currency.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.0001"
                          value={editValues.buy_rate}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              buy_rate: e.target.value,
                            })
                          }
                          className="w-24 h-8 px-2 text-right rounded border border-brand bg-white text-sm text-foreground ml-auto block"
                        />
                      ) : (
                        <span className="font-mono text-foreground">
                          {currency.buy_rate.toFixed(4)}
                        </span>
                      )}
                    </td>

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
                            onClick={() => adjustMargin(realIndex, "buy", -0.1)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-14 text-center font-mono text-sm font-medium text-foreground">
                            {currency.buy_margin_percent.toFixed(2)}%
                          </span>
                          <button
                            onClick={() => adjustMargin(realIndex, "buy", 0.1)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.0001"
                          value={editValues.sell_rate}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              sell_rate: e.target.value,
                            })
                          }
                          className="w-24 h-8 px-2 text-right rounded border border-brand bg-white text-sm text-foreground ml-auto block"
                        />
                      ) : (
                        <span className="font-mono text-foreground">
                          {currency.sell_rate.toFixed(4)}
                        </span>
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
                            onClick={() =>
                              adjustMargin(realIndex, "sell", -0.1)
                            }
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-14 text-center font-mono text-sm font-medium text-foreground">
                            {currency.sell_margin_percent.toFixed(2)}%
                          </span>
                          <button
                            onClick={() => adjustMargin(realIndex, "sell", 0.1)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-muted text-xs">
                      {formatDate(currency.last_updated)}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              disabled={isPending}
                              className="h-7 px-3 bg-brand text-white text-xs font-medium rounded-md hover:bg-brand-dark transition-colors cursor-pointer"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isPending}
                              className="h-7 px-3 border border-border text-xs font-medium text-muted rounded-md hover:text-foreground hover:border-border-strong transition-colors cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(realIndex)}
                              disabled={isPending}
                              className="h-7 px-3 border border-border text-xs font-medium text-muted rounded-md hover:text-brand hover:border-brand transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border"
                            >
                              แก้ไข
                            </button>
                            {onDeleteCurrency && (
                              <button
                                onClick={() => setDeleteTarget(currency)}
                                disabled={isPending}
                                className="h-7 w-7 flex items-center justify-center border border-border text-muted rounded-md hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:border-border disabled:hover:bg-transparent"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
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
                  <td
                    colSpan={isDraggable ? 8 : 7}
                    className="px-5 py-12 text-center text-muted"
                  >
                    ไม่พบสกุลเงินที่ค้นหา &ldquo;{search}&rdquo;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && onDeleteCurrency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white border border-border rounded-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  ยืนยันการลบ
                </h3>
                <p className="text-xs text-muted">
                  การลบจะไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-3 mb-5 flex items-center gap-3">
              <TwemojiFlag emoji={deleteTarget.flag} />
              <div>
                <span className="font-semibold text-foreground text-sm">
                  {deleteTarget.code}
                </span>
                <p className="text-xs text-muted">{deleteTarget.name}</p>
              </div>
            </div>
            <p className="text-sm text-muted mb-5">
              คุณต้องการลบสกุลเงิน{" "}
              <strong className="text-foreground">{deleteTarget.code}</strong>{" "}
              ({deleteTarget.name}) ออกจากระบบหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onDeleteCurrency(deleteTarget.code);
                  setDeleteTarget(null);
                }}
                className="flex-1 h-10 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <TrashIcon className="w-4 h-4" />
                ลบสกุลเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
