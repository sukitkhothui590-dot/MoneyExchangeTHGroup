"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "../../components/Header";
import ApprovalModal from "../../components/ApprovalModal";
import type { TopupRequest } from "@/lib/types/database";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import { fillTemplate } from "@/lib/admin/screenCopy";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function WalletPage() {
  const { t, locale } = useAdminLanguage();
  const p = t.pages.wallet;
  const w = t.screens.walletPage;
  const sh = t.screens.shared;
  const numLocale = locale === "th" ? "th-TH" : "en-US";

  const statusFilters = useMemo(
    () =>
      [
        { label: w.filterAll, value: "all" as const },
        { label: w.filterPending, value: "pending" as const },
        { label: w.filterApproved, value: "approved" as const },
        { label: w.filterRejected, value: "rejected" as const },
      ] as const,
    [w],
  );
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(
    null,
  );

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/topups");
      if (res.ok) {
        const json = await res.json();
        setRequests(json.data ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered = requests.filter(
    (r) => statusFilter === "all" || r.status === statusFilter,
  );
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const handleApprove = async (id: string, note: string) => {
    const prev = [...requests];
    setRequests((cur) =>
      cur.map((r) =>
        r.id === id ? { ...r, status: "approved" as const, note } : r,
      ),
    );

    try {
      const res = await fetch(`/api/topups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", note }),
      });
      if (!res.ok) setRequests(prev);
    } catch {
      setRequests(prev);
    }
  };

  const handleReject = async (id: string, note: string) => {
    const prev = [...requests];
    setRequests((cur) =>
      cur.map((r) =>
        r.id === id ? { ...r, status: "rejected" as const, note } : r,
      ),
    );

    try {
      const res = await fetch(`/api/topups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", note }),
      });
      if (!res.ok) setRequests(prev);
    } catch {
      setRequests(prev);
    }
  };

  const statusBadge = (status: TopupRequest["status"]) => {
    const styles = {
      pending: "bg-amber-50 text-amber-600 border-amber-200",
      approved: "bg-emerald-50 text-success border-emerald-200",
      rejected: "bg-red-50 text-danger border-red-200",
    };
    const labels = {
      pending: w.statusPending,
      approved: w.statusApproved,
      rejected: w.statusRejected,
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
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 h-8 px-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {fillTemplate(w.pendingBadge, { n: pendingCount })}
            </span>
          ) : null
        }
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted">{sh.loadingData}</p>
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit mb-4">
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

            {/* Table */}
            <div className="border border-border rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[750px]">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="text-left px-5 py-3 font-medium text-muted">
                        {w.colId}
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-muted">
                        {w.colMember}
                      </th>
                      <th className="text-right px-5 py-3 font-medium text-muted">
                        {w.colAmount}
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-muted">
                        {w.colTransferDate}
                      </th>
                      <th className="text-center px-5 py-3 font-medium text-muted">
                        {w.colStatus}
                      </th>
                      <th className="text-left px-5 py-3 font-medium text-muted">
                        {w.colNote}
                      </th>
                      <th className="text-center px-5 py-3 font-medium text-muted">
                        {w.colActions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-foreground text-xs">
                          {req.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-foreground">
                              {req.member_name}
                            </p>
                            <p className="text-xs text-muted">
                              {req.member_id}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                          ฿{req.amount.toLocaleString(numLocale)}
                        </td>
                        <td className="px-5 py-3.5 text-muted text-xs">
                          {req.transfer_date}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {statusBadge(req.status)}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted max-w-[200px] truncate">
                          {req.note || sh.dash}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {req.status === "pending" ? (
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="h-7 px-3 bg-brand text-white text-xs font-medium rounded-md hover:bg-brand-dark transition-colors cursor-pointer"
                            >
                              {sh.review}
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="h-7 px-3 border border-border text-xs font-medium text-muted rounded-md hover:text-foreground hover:border-border-strong transition-colors cursor-pointer"
                            >
                              {sh.viewDetails}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-muted"
                        >
                          {sh.noRowsCategory}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-muted mt-3">
              {fillTemplate(sh.showingOf, {
                shown: filtered.length,
                total: requests.length,
              })}
            </p>
          </>
        )}
      </div>

      <ApprovalModal
        isOpen={!!selectedRequest}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}
