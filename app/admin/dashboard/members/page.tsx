"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "../../components/Header";
import MemberDetailModal from "../../components/MemberDetailModal";
import type { Member } from "@/lib/types/database";
import { USE_MOCK_DATA } from "@/lib/config";
import {
  getMembers,
  setMembers as persistMembers,
} from "@/lib/mock/store";
import { normalizeMockMember, type MockMember } from "@/lib/mock/memberKyc";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import { fillTemplate } from "@/lib/admin/screenCopy";

type StatusFilter = "all" | "active" | "suspended" | "banned";

export default function MembersPage() {
  const { t, locale } = useAdminLanguage();
  const p = t.pages.members;
  const mp = t.screens.membersPage;
  const sh = t.screens.shared;
  const numLocale = locale === "th" ? "th-TH" : "en-US";

  const statusFilters = useMemo(
    () =>
      [
        { label: mp.filterAll, value: "all" as const },
        { label: mp.filterActive, value: "active" as const },
        { label: mp.filterSuspended, value: "suspended" as const },
        { label: mp.filterBanned, value: "banned" as const },
      ] as const,
    [mp],
  );
  const [members, setMembers] = useState<MockMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedMember, setSelectedMember] = useState<MockMember | null>(null);

  const fetchMembers = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setMembers(getMembers());
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const json = await res.json();
        const rows = (json.data ?? []) as Member[];
        setMembers(rows.map((m) => normalizeMockMember(m)));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdate = async (updated: Member) => {
    const prev = [...members];
    const next = members.map((m) =>
      m.id === updated.id
        ? normalizeMockMember({ ...updated, kyc: m.kyc })
        : m,
    );
    setMembers(next);
    setSelectedMember(next.find((x) => x.id === updated.id) ?? null);

    if (USE_MOCK_DATA) {
      persistMembers(next);
      return;
    }

    try {
      const res = await fetch(`/api/members/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
        }),
      });
      if (!res.ok) {
        setMembers(prev);
      }
    } catch {
      setMembers(prev);
    }
  };

  const handleToggleStatus = async (member: Member) => {
    const row = members.find((m) => m.id === member.id);
    if (!row) return;
    const newStatus = row.status === "active" ? "suspended" : "active";
    const updated = { ...row, status: newStatus as Member["status"] };
    const prev = [...members];
    const next = members.map((m) =>
      m.id === row.id ? normalizeMockMember(updated) : m,
    );
    setMembers(next);
    setSelectedMember(next.find((x) => x.id === row.id) ?? null);

    if (USE_MOCK_DATA) {
      persistMembers(next);
      return;
    }

    try {
      const res = await fetch(`/api/members/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setMembers(prev);
      }
    } catch {
      setMembers(prev);
    }
  };

  const statusBadge = (status: Member["status"]) => {
    const styles = {
      active: "bg-emerald-50 text-success border-emerald-200",
      suspended: "bg-amber-50 text-amber-600 border-amber-200",
      banned: "bg-red-50 text-danger border-red-200",
    };
    const labels = {
      active: mp.statusActive,
      suspended: mp.statusSuspended,
      banned: mp.statusBanned,
    };
    return (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <>
      <Header title={p.title} subtitle={p.subtitle} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={mp.searchPh}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
            />
          </div>
          <div className="flex gap-1 bg-surface rounded-lg p-1">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
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

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {mp.colMember}
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {mp.colPhone}
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-muted">
                    {mp.colStatus}
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    {mp.colJoined}
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-muted">
                    {mp.colWallet}
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-muted">
                    {sh.manage}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {member.phone}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {statusBadge(member.status)}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">
                      {member.join_date}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-foreground">
                      ฿{member.wallet_balance.toLocaleString(numLocale)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="h-7 px-3 border border-border text-xs font-medium text-muted rounded-md hover:text-brand hover:border-brand transition-colors cursor-pointer"
                      >
                        {sh.viewInfo}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-muted"
                    >
                      {mp.emptySearch}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted mt-3">
          {fillTemplate(sh.showingMembers, {
            shown: filtered.length,
            total: members.length,
          })}
        </p>
      </div>

      <MemberDetailModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onUpdate={handleUpdate}
        onToggleStatus={handleToggleStatus}
      />
    </>
  );
}
