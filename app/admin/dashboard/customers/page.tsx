"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import type { Member } from "@/lib/types/database";
import { USE_MOCK_DATA } from "@/lib/config";
import {
  addMember,
  deleteMember,
  getMembers,
  newMockId,
  setMembers as persistMembers,
} from "@/lib/mock/store";
import type { MemberKycProfile, MockMember } from "@/lib/mock/memberKyc";
import { createDefaultKyc } from "@/lib/mock/memberKyc";
import CustomerKycModal from "../../components/CustomerKycModal";
import CustomerDetailModal from "../../components/CustomerDetailModal";
import { MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { AdminTranslations } from "@/lib/admin/translations";
import type { KycStatus, RiskTier } from "@/lib/mock/memberKyc";

type StatusFilter = "all" | "active" | "suspended" | "banned";

export default function AdminCustomersPage() {
  const { t } = useAdminLanguage();
  const p = t.pages.customers;
  const identity = t.screens.identity;
  const sh = t.screens.shared;

  const statusFilters = useMemo(
    () =>
      [
        { label: identity.statusAll, value: "all" as const },
        { label: identity.statusActive, value: "active" as const },
        { label: identity.statusSuspended, value: "suspended" as const },
        { label: identity.statusBanned, value: "banned" as const },
      ] as const,
    [identity],
  );
  const [members, setMembers] = useState<MockMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [kycMemberId, setKycMemberId] = useState<string | null>(null);
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const load = useCallback(async () => {
    // Always try Supabase first, fallback to mock
    try {
      const res = await fetch("/api/admin/members");
      if (res.ok) {
        const json = await res.json();
        const rows = (json.data ?? []) as Member[];
        if (rows.length > 0 || !USE_MOCK_DATA) {
          setMembers(
            rows.map((m) => ({
              ...m,
              kyc: {
                ...createDefaultKyc(m.name),
                id_doc_number: m.identity_lookup_key ?? "",
                kyc_status: m.verified
                  ? ("approved" as const)
                  : ("draft" as const),
              },
            })),
          );
          setLoading(false);
          return;
        }
      }
    } catch {
      /* Supabase unavailable — fall through to mock */
    }

    if (USE_MOCK_DATA) {
      setMembers(getMembers());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q);
  }, []);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(search) ||
      (m.kyc?.legal_name ?? "").toLowerCase().includes(q) ||
      (m.kyc?.id_doc_number ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const createMember = () => {
    if (!USE_MOCK_DATA) return;
    const m: Member = {
      id: newMockId(),
      name: draft.name.trim() || identity.unnamed,
      email: draft.email.trim().toLowerCase() || `u_${newMockId()}@example.com`,
      phone: draft.phone.trim() || "0000000000",
      status: "active",
      join_date: new Date().toISOString(),
      wallet_balance: 0,
      verified: false,
      created_at: new Date().toISOString(),
      identity_lookup_key: null,
    };
    addMember(m);
    setMembers(getMembers());
    setShowCreate(false);
    setDraft({ name: "", email: "", phone: "" });
  };

  const remove = async (memberId: string) => {
    if (!confirm(identity.confirmDelete)) return;

    // Always try Supabase first
    try {
      const res = await fetch("/api/admin/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        // Also remove from mock store if applicable
        if (USE_MOCK_DATA) {
          try { deleteMember(memberId); } catch { /* ignore */ }
        }
        return;
      }
      const json = await res.json().catch(() => ({ error: "Unknown error" }));
      alert(`ลบไม่สำเร็จ: ${json.error}`);
    } catch {
      // API unreachable — fallback to mock
      if (USE_MOCK_DATA) {
        deleteMember(memberId);
        setMembers(getMembers());
        return;
      }
      alert("ลบไม่สำเร็จ — ไม่สามารถเชื่อมต่อ server");
    }
  };

  const patchField = (id: string, patch: Partial<MockMember>) => {
    if (!USE_MOCK_DATA) return;
    const next = members.map((m) => (m.id === id ? { ...m, ...patch } : m));
    persistMembers(next);
    setMembers(next);
  };

  const saveKyc = (id: string, kyc: MemberKycProfile) => {
    patchField(id, { kyc });
  };

  return (
    <>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="h-9 px-4 rounded-lg bg-brand text-white text-sm font-medium"
          >
            {identity.addCustomer}
          </button>
        }
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <AdminPageHelp
          idPrefix="customers"
          title={p.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={p.helpSections}
        />
        {loading ? (
          <p className="text-sm text-muted">{sh.loading}</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="relative w-full max-w-xs">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder={identity.searchPh}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm"
                />
              </div>
              <div className="flex gap-1 bg-surface rounded-lg p-1 flex-wrap">
                {statusFilters.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      statusFilter === f.value
                        ? "bg-white text-brand border border-border"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-white overflow-x-auto">
              <table className="w-full text-sm min-w-[1140px]">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-4 py-3 text-muted font-medium">
                      {identity.colName}
                    </th>
                    <th className="text-left px-4 py-3 text-muted font-medium min-w-[10.5rem]">
                      {identity.colMemberId}
                    </th>
                    <th className="text-left px-4 py-3 text-muted font-medium min-w-[200px]">
                      {identity.colEmail}
                    </th>
                    <th className="text-left px-4 py-3 text-muted font-medium min-w-[140px]">
                      {identity.colPhone}
                    </th>
                    <th className="text-left px-4 py-3 text-muted font-medium">
                      {identity.colKyc}
                    </th>
                    <th className="text-left px-4 py-3 text-muted font-medium">
                      {identity.colRisk}
                    </th>
                    <th className="text-left px-4 py-3 text-muted font-medium">
                      {identity.colStatus}
                    </th>
                    <th className="text-right px-4 py-3 text-muted font-medium">
                      {identity.colWallet}
                    </th>
                    <th className="text-center px-4 py-3 text-muted font-medium w-[80px]">
                      ดูข้อมูล
                    </th>
                    <th className="text-center px-4 py-3 text-muted font-medium w-[80px]">
                      {identity.btnKyc}
                    </th>
                    <th className="text-center px-4 py-3 text-muted font-medium">
                      {identity.colDelete}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setDetailMemberId(m.id)}
                          className="text-sm text-brand hover:underline font-medium text-left truncate max-w-[200px] block"
                          title={m.name}
                        >
                          {m.name || "ไม่ระบุชื่อ"}
                        </button>
                      </td>
                      <td className="px-4 py-3 align-top max-w-[220px]">
                        <p
                          className="font-mono text-[11px] text-muted break-all leading-snug"
                          title={m.id}
                        >
                          {m.id}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          value={m.email}
                          onChange={(e) =>
                            patchField(m.id, { email: e.target.value })
                          }
                          className="w-full min-w-0 max-w-[260px] text-xs border border-transparent hover:border-border rounded px-2 py-1"
                          type="email"
                          autoComplete="off"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          value={m.phone}
                          onChange={(e) =>
                            patchField(m.id, { phone: e.target.value })
                          }
                          className="w-full min-w-[120px] max-w-[180px] text-xs tabular-nums border border-transparent hover:border-border rounded px-2 py-1"
                          inputMode="tel"
                          autoComplete="off"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                            m.kyc.kyc_status === "approved"
                              ? "bg-emerald-50 text-success border-emerald-200"
                              : m.kyc.kyc_status === "pending_review"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : m.kyc.kyc_status === "rejected"
                                  ? "bg-red-50 text-danger border-red-200"
                                  : "bg-surface text-muted border-border"
                          }`}
                        >
                          {kycStatusLabel(m.kyc.kyc_status, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {riskLabel(m.kyc.risk_tier, t)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={m.status}
                          onChange={(e) =>
                            patchField(m.id, {
                              status: e.target.value as Member["status"],
                            })
                          }
                          className="text-xs border border-border rounded px-2 py-1"
                        >
                          <option value="active">{identity.optActive}</option>
                          <option value="suspended">{identity.optSuspended}</option>
                          <option value="banned">{identity.optBanned}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <input
                          type="number"
                          value={m.wallet_balance}
                          onChange={(e) =>
                            patchField(m.id, {
                              wallet_balance: Number(e.target.value),
                            })
                          }
                          className="w-24 text-right text-sm border border-border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setDetailMemberId(m.id)}
                          className="text-xs font-medium text-brand border border-brand/30 rounded-lg px-2 py-1 hover:bg-brand-subtle inline-flex items-center gap-1"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          ดู
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setKycMemberId(m.id)}
                          className="text-xs font-medium text-brand border border-brand/30 rounded-lg px-2 py-1 hover:bg-brand-subtle"
                        >
                          {identity.btnKyc}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => remove(m.id)}
                          className="text-xs text-danger hover:underline"
                        >
                          {sh.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <CustomerDetailModal
        memberId={detailMemberId}
        isOpen={!!detailMemberId}
        onClose={() => setDetailMemberId(null)}
      />

      <CustomerKycModal
        member={
          kycMemberId
            ? members.find((x) => x.id === kycMemberId) ?? null
            : null
        }
        isOpen={!!kycMemberId}
        onClose={() => setKycMemberId(null)}
        onSave={(kyc) => {
          if (kycMemberId) saveKyc(kycMemberId, kyc);
        }}
      />

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl border border-border w-full max-w-md p-5 space-y-3 shadow-xl">
            <h2 className="font-semibold">{identity.modalTitle}</h2>
            <input
              placeholder={identity.phName}
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-lg border border-border text-sm"
            />
            <input
              placeholder={identity.phEmail}
              type="email"
              value={draft.email}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-lg border border-border text-sm"
            />
            <input
              placeholder={identity.phPhone}
              value={draft.phone}
              onChange={(e) =>
                setDraft((d) => ({ ...d, phone: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-lg border border-border text-sm tabular-nums"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="h-9 px-4 rounded-lg border border-border text-sm"
              >
                {sh.cancel}
              </button>
              <button
                type="button"
                onClick={createMember}
                className="h-9 px-4 rounded-lg bg-brand text-white text-sm"
              >
                {sh.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function kycStatusLabel(s: KycStatus, t: AdminTranslations): string {
  const km = t.screens.kycMock;
  const map: Record<KycStatus, string> = {
    draft: km.st_draft,
    pending_review: km.st_pending,
    approved: km.st_approved,
    rejected: km.st_rejected,
    expired: km.st_expired,
  };
  return map[s];
}

function riskLabel(tier: RiskTier, t: AdminTranslations): string {
  const km = t.screens.kycMock;
  if (tier === "low") return km.riskLow;
  if (tier === "medium") return km.riskMed;
  return km.riskHigh;
}
