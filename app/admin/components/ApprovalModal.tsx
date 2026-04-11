"use client";

import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { TopupRequest } from "@/lib/types/database";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

interface ApprovalModalProps {
  isOpen: boolean;
  request: TopupRequest | null;
  onClose: () => void;
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, note: string) => void;
}

export default function ApprovalModal({
  isOpen,
  request,
  onClose,
  onApprove,
  onReject,
}: ApprovalModalProps) {
  const [note, setNote] = useState("");
  const { locale, t } = useAdminLanguage();
  const a = t.screens.approvalModal;
  const numLocale = locale === "th" ? "th-TH" : "en-US";

  if (!isOpen || !request) return null;

  const handleApprove = () => {
    onApprove(request.id, note);
    setNote("");
    onClose();
  };

  const handleReject = () => {
    onReject(request.id, note);
    setNote("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white border border-border rounded-2xl w-full max-w-[480px] mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {a.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Request Info */}
        <div className="bg-surface rounded-xl p-4 mb-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted">{a.reqId}</span>
            <span className="text-sm font-medium text-foreground">
              {request.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted">{a.member}</span>
            <span className="text-sm font-medium text-foreground">
              {request.member_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted">{a.amount}</span>
            <span className="text-sm font-bold text-brand">
              ฿{request.amount.toLocaleString(numLocale)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted">{a.transferDate}</span>
            <span className="text-sm text-foreground">
              {request.transfer_date}
            </span>
          </div>
        </div>

        {/* Slip placeholder */}
        <div className="border border-dashed border-border rounded-xl h-40 flex items-center justify-center mb-5 bg-surface/50">
          <div className="text-center">
            <p className="text-sm text-muted">{a.slipTitle}</p>
            <p className="text-xs text-muted/60 mt-1">{a.slipHint}</p>
          </div>
        </div>

        {/* Note */}
        <div className="mb-5">
          <label
            htmlFor="approval-note"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {a.noteLabel}
          </label>
          <textarea
            id="approval-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={a.notePlaceholder}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 h-10 bg-red-50 text-danger border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <XCircleIcon className="w-4 h-4" />
            {a.reject}
          </button>
          <button
            onClick={handleApprove}
            className="flex-1 h-10 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {a.approve}
          </button>
        </div>
      </div>
    </div>
  );
}
