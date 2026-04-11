"use client";

import { useState, useRef, useEffect } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { Currency } from "@/lib/types/database";
import TwemojiFlag from "./TwemojiFlag";

interface AddCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (currency: Currency) => void;
  existingCodes: string[];
}

const FLAG_EMOJIS = [
  { code: "USD", flag: "🇺🇸", label: "US Dollar" },
  { code: "EUR", flag: "🇪🇺", label: "Euro" },
  { code: "GBP", flag: "🇬🇧", label: "British Pound" },
  { code: "JPY", flag: "🇯🇵", label: "Japanese Yen" },
  { code: "CNY", flag: "🇨🇳", label: "Chinese Yuan" },
  { code: "KRW", flag: "🇰🇷", label: "Korean Won" },
  { code: "HKD", flag: "🇭🇰", label: "Hong Kong Dollar" },
  { code: "SGD", flag: "🇸🇬", label: "Singapore Dollar" },
  { code: "AUD", flag: "🇦🇺", label: "Australian Dollar" },
  { code: "NZD", flag: "🇳🇿", label: "New Zealand Dollar" },
  { code: "CHF", flag: "🇨🇭", label: "Swiss Franc" },
  { code: "CAD", flag: "🇨🇦", label: "Canadian Dollar" },
  { code: "MYR", flag: "🇲🇾", label: "Malaysian Ringgit" },
  { code: "IDR", flag: "🇮🇩", label: "Indonesian Rupiah" },
  { code: "PHP", flag: "🇵🇭", label: "Philippine Peso" },
  { code: "VND", flag: "🇻🇳", label: "Vietnamese Dong" },
  { code: "INR", flag: "🇮🇳", label: "Indian Rupee" },
  { code: "TWD", flag: "🇹🇼", label: "Taiwan Dollar" },
  { code: "AED", flag: "🇦🇪", label: "UAE Dirham" },
  { code: "SAR", flag: "🇸🇦", label: "Saudi Riyal" },
  { code: "QAR", flag: "🇶🇦", label: "Qatari Riyal" },
  { code: "KWD", flag: "🇰🇼", label: "Kuwaiti Dinar" },
  { code: "BHD", flag: "🇧🇭", label: "Bahraini Dinar" },
  { code: "OMR", flag: "🇴🇲", label: "Omani Rial" },
  { code: "SEK", flag: "🇸🇪", label: "Swedish Krona" },
  { code: "NOK", flag: "🇳🇴", label: "Norwegian Krone" },
  { code: "DKK", flag: "🇩🇰", label: "Danish Krone" },
  { code: "ZAR", flag: "🇿🇦", label: "South African Rand" },
  { code: "RUB", flag: "🇷🇺", label: "Russian Ruble" },
  { code: "BRL", flag: "🇧🇷", label: "Brazilian Real" },
  { code: "MXN", flag: "🇲🇽", label: "Mexican Peso" },
  { code: "THB", flag: "🇹🇭", label: "Thai Baht" },
  { code: "LAK", flag: "🇱🇦", label: "Lao Kip" },
  { code: "MMK", flag: "🇲🇲", label: "Myanmar Kyat" },
  { code: "KHR", flag: "🇰🇭", label: "Cambodian Riel" },
  { code: "BND", flag: "🇧🇳", label: "Brunei Dollar" },
  { code: "PKR", flag: "🇵🇰", label: "Pakistani Rupee" },
  { code: "BDT", flag: "🇧🇩", label: "Bangladeshi Taka" },
  { code: "LKR", flag: "🇱🇰", label: "Sri Lankan Rupee" },
  { code: "NPR", flag: "🇳🇵", label: "Nepalese Rupee" },
  { code: "EGP", flag: "🇪🇬", label: "Egyptian Pound" },
  { code: "TRY", flag: "🇹🇷", label: "Turkish Lira" },
  { code: "ILS", flag: "🇮🇱", label: "Israeli Shekel" },
  { code: "JOD", flag: "🇯🇴", label: "Jordanian Dinar" },
  { code: "CZK", flag: "🇨🇿", label: "Czech Koruna" },
  { code: "PLN", flag: "🇵🇱", label: "Polish Zloty" },
  { code: "HUF", flag: "🇭🇺", label: "Hungarian Forint" },
];

const EMPTY_FORM = {
  code: "",
  name: "",
  flag: "",
  buyRate: "",
  sellRate: "",
  buyMarginPercent: "",
  sellMarginPercent: "",
};

export default function AddCurrencyModal({
  isOpen,
  onClose,
  onAdd,
  existingCodes,
}: AddCurrencyModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [showFlagPicker, setShowFlagPicker] = useState(false);
  const [flagSearch, setFlagSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowFlagPicker(false);
      }
    };
    if (showFlagPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFlagPicker]);

  if (!isOpen) return null;

  const set = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSelectFlag = (emoji: string, code: string, label: string) => {
    setForm((prev) => ({
      ...prev,
      flag: emoji,
      code: prev.code || code,
      name: prev.name || label,
    }));
    setErrors((prev) => ({ ...prev, flag: "" }));
    setShowFlagPicker(false);
    setFlagSearch("");
  };

  const filteredFlags = FLAG_EMOJIS.filter(
    (f) =>
      f.code.toLowerCase().includes(flagSearch.toLowerCase()) ||
      f.label.toLowerCase().includes(flagSearch.toLowerCase()),
  );

  const validate = () => {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.code.trim()) e.code = "กรุณากรอกรหัสสกุลเงิน";
    else if (existingCodes.includes(form.code.toUpperCase()))
      e.code = "รหัสสกุลเงินนี้มีอยู่แล้ว";
    if (!form.name.trim()) e.name = "กรุณากรอกชื่อสกุลเงิน";
    if (!form.flag.trim()) e.flag = "กรุณาเลือกหรือกรอกธงชาติ";
    if (!form.buyRate || isNaN(parseFloat(form.buyRate)))
      e.buyRate = "กรุณากรอกอัตราซื้อ";
    if (!form.sellRate || isNaN(parseFloat(form.sellRate)))
      e.sellRate = "กรุณากรอกอัตราขาย";

    const buy = parseFloat(form.buyRate);
    const sell = parseFloat(form.sellRate);
    if (!isNaN(buy) && !isNaN(sell) && buy >= sell) {
      e.buyRate = "อัตราซื้อต้องน้อยกว่าอัตราขาย";
      e.sellRate = "อัตราขายต้องมากกว่าอัตราซื้อ";
    }

    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const now = new Date()
      .toLocaleString("sv-SE", { hour12: false })
      .slice(0, 16);

    onAdd({
      id: 0,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      flag: form.flag.trim(),
      buy_rate: parseFloat(form.buyRate),
      sell_rate: parseFloat(form.sellRate),
      buy_margin_percent: form.buyMarginPercent
        ? parseFloat(form.buyMarginPercent)
        : 0,
      sell_margin_percent: form.sellMarginPercent
        ? parseFloat(form.sellMarginPercent)
        : 0,
      last_updated: now,
      sort_order: 0,
    });

    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setShowFlagPicker(false);
    setFlagSearch("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />
      <div className="relative bg-white border border-border rounded-2xl w-full max-w-[480px] mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              เพิ่มสกุลเงิน
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Row: Code + Flag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                รหัสสกุลเงิน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="เช่น USD"
                className={`w-full h-10 px-3.5 rounded-lg border text-sm text-foreground placeholder:text-muted/50 transition-colors bg-white ${
                  errors.code
                    ? "border-red-400"
                    : "border-border hover:border-border-strong"
                }`}
              />
              {errors.code && (
                <p className="text-xs text-red-500 mt-1">{errors.code}</p>
              )}
            </div>
            <div className="relative" ref={pickerRef}>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                ธงชาติ (Emoji)
              </label>
              <button
                type="button"
                onClick={() => setShowFlagPicker(!showFlagPicker)}
                className={`w-full h-10 px-3.5 rounded-lg border text-sm text-left transition-colors bg-white cursor-pointer flex items-center gap-2 ${
                  errors.flag
                    ? "border-red-400"
                    : "border-border hover:border-border-strong"
                }`}
              >
                {form.flag ? (
                  <TwemojiFlag emoji={form.flag} />
                ) : (
                  <span className="text-muted/50">เลือกธงชาติ</span>
                )}
              </button>
              {errors.flag && (
                <p className="text-xs text-red-500 mt-1">{errors.flag}</p>
              )}

              {/* Flag Picker Dropdown */}
              {showFlagPicker && (
                <div className="absolute z-50 top-full mt-1 left-0 w-72 bg-white border border-border rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      type="text"
                      value={flagSearch}
                      onChange={(e) => setFlagSearch(e.target.value)}
                      placeholder="ค้นหา เช่น USD, Euro..."
                      className="w-full h-8 px-3 rounded-md border border-border text-sm text-foreground placeholder:text-muted/50 bg-white"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {filteredFlags.map((f) => (
                      <button
                        key={f.code}
                        type="button"
                        onClick={() =>
                          handleSelectFlag(f.flag, f.code, f.label)
                        }
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-sm rounded-md hover:bg-surface transition-colors cursor-pointer"
                      >
                        <TwemojiFlag emoji={f.flag} />
                        <span className="font-medium text-foreground">
                          {f.code}
                        </span>
                        <span className="text-muted text-xs truncate">
                          {f.label}
                        </span>
                      </button>
                    ))}
                    {filteredFlags.length === 0 && (
                      <p className="px-3 py-3 text-xs text-muted text-center">
                        ไม่พบ — พิมพ์ emoji
                        โดยตรงในช่องด้านล่างก็ได้
                      </p>
                    )}
                  </div>
                  <div className="p-2 border-t border-border">
                    <input
                      type="text"
                      value={form.flag}
                      onChange={(e) => set("flag", e.target.value)}
                      placeholder="หรือพิมพ์ emoji เอง เช่น 🇺🇸"
                      className="w-full h-8 px-3 rounded-md border border-border text-sm text-foreground placeholder:text-muted/50 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              ชื่อสกุลเงิน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="เช่น US Dollar"
              className={`w-full h-10 px-3.5 rounded-lg border text-sm text-foreground placeholder:text-muted/50 transition-colors bg-white ${
                errors.name
                  ? "border-red-400"
                  : "border-border hover:border-border-strong"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Row: Buy + Sell */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                อัตราซื้อ (THB) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={form.buyRate}
                onChange={(e) => set("buyRate", e.target.value)}
                placeholder="เช่น 34.25"
                className={`w-full h-10 px-3.5 rounded-lg border text-sm text-foreground placeholder:text-muted/50 transition-colors bg-white ${
                  errors.buyRate
                    ? "border-red-400"
                    : "border-border hover:border-border-strong"
                }`}
              />
              {errors.buyRate && (
                <p className="text-xs text-red-500 mt-1">{errors.buyRate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                อัตราขาย (THB) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={form.sellRate}
                onChange={(e) => set("sellRate", e.target.value)}
                placeholder="เช่น 34.75"
                className={`w-full h-10 px-3.5 rounded-lg border text-sm text-foreground placeholder:text-muted/50 transition-colors bg-white ${
                  errors.sellRate
                    ? "border-red-400"
                    : "border-border hover:border-border-strong"
                }`}
              />
              {errors.sellRate && (
                <p className="text-xs text-red-500 mt-1">{errors.sellRate}</p>
              )}
            </div>
          </div>

          {/* Margin Buy + Sell (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                มาร์จิ้นซื้อ (%)
                <span className="text-muted text-xs font-normal ml-1">
                  ไม่บังคับ
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.buyMarginPercent}
                  onChange={(e) => set("buyMarginPercent", e.target.value)}
                  placeholder="ค่าเริ่มต้น 0"
                  className="w-full h-10 px-3.5 pr-10 rounded-lg border text-sm text-foreground placeholder:text-muted/50 transition-colors bg-white border-border hover:border-border-strong"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                  %
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                มาร์จิ้นขาย (%)
                <span className="text-muted text-xs font-normal ml-1">
                  ไม่บังคับ
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.sellMarginPercent}
                  onChange={(e) => set("sellMarginPercent", e.target.value)}
                  placeholder="ค่าเริ่มต้น 0"
                  className="w-full h-10 px-3.5 pr-10 rounded-lg border text-sm text-foreground placeholder:text-muted/50 transition-colors bg-white border-border hover:border-border-strong"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 h-10 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            เพิ่มสกุลเงิน
          </button>
        </div>
      </div>
    </div>
  );
}
