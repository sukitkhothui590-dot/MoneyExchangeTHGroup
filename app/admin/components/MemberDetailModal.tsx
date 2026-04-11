"use client";

import {
  XMarkIcon,
  ShieldExclamationIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import type { Member } from "@/lib/types/database";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

interface MemberDetailModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onUpdate: (updated: Member) => void;
  onToggleStatus: (member: Member) => void;
}

export default function MemberDetailModal({
  isOpen,
  member,
  onClose,
  onUpdate,
  onToggleStatus,
}: MemberDetailModalProps) {
  const { locale, t } = useAdminLanguage();
  const mm = t.screens.memberModal;
  const sh = t.screens.shared;
  const numLocale = locale === "th" ? "th-TH" : "en-US";

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: "",
    email: "",
    phone: "",
  });

  if (!isOpen || !member) return null;

  const startEdit = () => {
    setEditValues({
      name: member.name,
      email: member.email,
      phone: member.phone,
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdate({
      ...member,
      name: editValues.name,
      email: editValues.email,
      phone: editValues.phone,
    });
    setIsEditing(false);
  };

  const statusLabel =
    member.status === "active"
      ? mm.statusActive
      : member.status === "suspended"
        ? mm.statusSuspended
        : mm.statusBanned;
  const statusColor =
    member.status === "active"
      ? "bg-emerald-50 text-success border-emerald-200"
      : member.status === "suspended"
        ? "bg-amber-50 text-amber-600 border-amber-200"
        : "bg-red-50 text-danger border-red-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white border border-border rounded-2xl w-full max-w-[520px] mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {mm.title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar + Status */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-subtle text-brand flex items-center justify-center text-lg font-semibold flex-shrink-0">
            {member.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{member.name}</p>
            <p className="text-sm text-muted">{member.id}</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Fields */}
        <div className="space-y-4 mb-6">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {mm.lblFullName}
                </label>
                <input
                  value={editValues.name}
                  onChange={(e) =>
                    setEditValues({ ...editValues, name: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {mm.lblEmail}
                </label>
                <input
                  value={editValues.email}
                  onChange={(e) =>
                    setEditValues({ ...editValues, email: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {mm.lblPhone}
                </label>
                <input
                  value={editValues.phone}
                  onChange={(e) =>
                    setEditValues({ ...editValues, phone: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-lg p-3">
                <p className="text-xs text-muted mb-0.5">{mm.lblEmail}</p>
                <p className="text-sm text-foreground">{member.email}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-xs text-muted mb-0.5">{mm.lblPhone}</p>
                <p className="text-sm text-foreground">{member.phone}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-xs text-muted mb-0.5">{mm.lblJoined}</p>
                <p className="text-sm text-foreground">{member.join_date}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-xs text-muted mb-0.5">{mm.lblWallet}</p>
                <p className="text-sm font-semibold text-foreground">
                  ฿{member.wallet_balance.toLocaleString(numLocale)}
                </p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-xs text-muted mb-0.5">{mm.lblVerified}</p>
                <p
                  className={`text-sm font-medium ${member.verified ? "text-success" : "text-amber-500"}`}
                >
                  {member.verified ? mm.verifiedYes : mm.verifiedNo}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                {sh.cancel}
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 h-10 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors cursor-pointer"
              >
                {sh.save}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEdit}
                className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                {mm.editInfo}
              </button>
              <button
                onClick={() => onToggleStatus(member)}
                className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2 ${
                  member.status === "active"
                    ? "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100"
                    : "bg-emerald-50 text-success border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <ShieldExclamationIcon className="w-4 h-4" />
                {member.status === "active" ? mm.suspend : mm.unsuspend}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
