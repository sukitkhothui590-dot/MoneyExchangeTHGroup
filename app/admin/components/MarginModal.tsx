"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface MarginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (buyMargin: number, sellMargin: number) => void;
  branchName?: string; // When set, indicates branch-specific mode
}

export default function MarginModal({
  isOpen,
  onClose,
  onApply,
  branchName,
}: MarginModalProps) {
  const [buyMargin, setBuyMargin] = useState("");
  const [sellMargin, setSellMargin] = useState("");

  if (!isOpen) return null;

  const handleApply = () => {
    const buyVal = parseFloat(buyMargin);
    const sellVal = parseFloat(sellMargin);
    if (!isNaN(buyVal) && !isNaN(sellVal)) {
      onApply(buyVal, sellVal);
      setBuyMargin("");
      setSellMargin("");
      onClose();
    }
  };

  const title = branchName
    ? `ตั้งค่ามาร์จิ้นทั้งหมด — ${branchName}`
    : "ตั้งค่ามาร์จิ้นทั้งหมด";

  const description = branchName
    ? `กำหนดเปอร์เซ็นต์มาร์จิ้นซื้อและขายที่จะนำไปใช้กับสกุลเงินทั้งหมดของสาขา "${branchName}" การตั้งค่านี้จะแทนที่มาร์จิ้นแต่ละสกุลเงินของสาขานี้`
    : "กำหนดเปอร์เซ็นต์มาร์จิ้นซื้อและขายที่จะนำไปใช้กับสกุลเงินทั้งหมด การตั้งค่านี้จะแทนที่มาร์จิ้นแต่ละสกุลเงิน";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white border border-border rounded-2xl w-full max-w-[420px] mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted mb-4">{description}</p>

        <div className="space-y-4 mb-5">
          <div>
            <label
              htmlFor="buy-margin"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              มาร์จิ้นซื้อ (%)
            </label>
            <div className="relative">
              <input
                id="buy-margin"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={buyMargin}
                onChange={(e) => setBuyMargin(e.target.value)}
                placeholder="เช่น 1.50"
                className="w-full h-11 px-3.5 pr-10 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                %
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="sell-margin"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              มาร์จิ้นขาย (%)
            </label>
            <div className="relative">
              <input
                id="sell-margin"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={sellMargin}
                onChange={(e) => setSellMargin(e.target.value)}
                placeholder="เช่น 2.50"
                className="w-full h-11 px-3.5 pr-10 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-10 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors cursor-pointer"
          >
            ใช้กับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
