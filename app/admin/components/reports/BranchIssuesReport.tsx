"use client";

import { useCallback, useMemo, useState } from "react";
import type { Branch } from "@/lib/types/database";
import type { BranchIssueRow } from "@/lib/admin/branchIssueReport";
import ReportSectionCard from "../ReportSectionCard";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

type Labels = {
  sectionTitle: string;
  colBranch: string;
  colReportedAt: string;
  colReporter: string;
  colSummary: string;
  colSeverity: string;
  colDetail: string;
  severityLow: string;
  severityMedium: string;
  severityHigh: string;
  empty: string;
  formToggle: string;
  formBranch: string;
  formSummary: string;
  formDetail: string;
  formSeverity: string;
  formSubmit: string;
  formSubmitting: string;
  formSuccess: string;
  formCancel: string;
  formErrorRequired: string;
};

/** ชื่อผู้ส่ง — ถ้าไม่มีใน profiles จะโชว์รหัสผู้ใช้ย่อ (ไม่ให้ว่างโดยไม่มีเหตุ) */
function reporterDisplay(row: BranchIssueRow): string {
  const n = row.reporter_name?.trim();
  if (n) return n;
  const cid = row.created_by?.trim();
  if (cid) return `ผู้ใช้ ${cid.slice(0, 8)}…`;
  return "—";
}

function severityClass(sev: BranchIssueRow["severity"]): string {
  if (sev === "high") {
    return "border-red-200 bg-red-50 text-red-800";
  }
  if (sev === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-border bg-surface text-muted";
}

export default function BranchIssuesReport({
  issues,
  branches,
  branchLabel,
  labels,
  dateLocale,
  allowCreate,
  onCreated,
}: {
  issues: BranchIssueRow[];
  branches: Pick<Branch, "id" | "name" | "name_th">[];
  branchLabel: (branchId: string) => string;
  labels: Labels;
  dateLocale: string;
  allowCreate: boolean;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [severity, setSeverity] = useState<BranchIssueRow["severity"]>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const severityLabel = useCallback(
    (s: BranchIssueRow["severity"]) => {
      if (s === "high") return labels.severityHigh;
      if (s === "medium") return labels.severityMedium;
      return labels.severityLow;
    },
    [labels],
  );

  const sortedIssues = useMemo(() => {
    const copy = [...issues];
    copy.sort((a, b) => {
      const ba = branchLabel(a.branch_id);
      const bb = branchLabel(b.branch_id);
      const cmp = ba.localeCompare(bb, dateLocale);
      if (cmp !== 0) return cmp;
      return (
        new Date(b.reported_at).getTime() -
        new Date(a.reported_at).getTime()
      );
    });
    return copy;
  }, [issues, branchLabel, dateLocale]);

  const submit = async () => {
    setFormErr("");
    setOkMsg("");
    if (!branchId.trim() || !summary.trim()) {
      setFormErr(labels.formErrorRequired);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/reports/branch-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: branchId,
          summary: summary.trim(),
          detail: detail.trim(),
          severity,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormErr((json.error as string) ?? "Error");
        return;
      }
      setSummary("");
      setDetail("");
      setSeverity("medium");
      setOpen(false);
      setOkMsg(labels.formSuccess);
      onCreated?.();
    } catch {
      setFormErr("Network");
    } finally {
      setSubmitting(false);
    }
  };

  const tableWrapClass =
    "overflow-x-auto [&_thead_tr]:border-b [&_thead_tr]:border-border/60 [&_tbody_tr]:border-b [&_tbody_tr]:border-border/40 [&_tbody_tr:last-child]:border-0";

  return (
    <ReportSectionCard
      title={labels.sectionTitle}
      action={
        allowCreate ? (
          <button
            type="button"
            onClick={() => {
              setOpen((o) => !o);
              setFormErr("");
              setOkMsg("");
              if (!branchId && branches[0]) setBranchId(branches[0].id);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            <PlusCircleIcon className="h-5 w-5" />
            {labels.formToggle}
          </button>
        ) : null
      }
    >
      {okMsg ? (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {okMsg}
        </p>
      ) : null}

      {open && allowCreate ? (
        <div className="mb-6 rounded-2xl border border-border/70 bg-surface-50/80 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">{labels.formBranch}</span>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="rounded-xl border border-border bg-white px-3 py-2 text-foreground"
              >
                <option value="">{labels.formBranch}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name_th} ({b.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">{labels.formSeverity}</span>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as BranchIssueRow["severity"])
                }
                className="rounded-xl border border-border bg-white px-3 py-2 text-foreground"
              >
                <option value="low">{labels.severityLow}</option>
                <option value="medium">{labels.severityMedium}</option>
                <option value="high">{labels.severityHigh}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">{labels.formSummary}</span>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="rounded-xl border border-border bg-white px-3 py-2 text-foreground"
                maxLength={500}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">{labels.formDetail}</span>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                className="rounded-xl border border-border bg-white px-3 py-2 text-foreground"
                maxLength={4000}
              />
            </label>
          </div>
          {formErr ? (
            <p className="mt-2 text-sm text-red-700">{formErr}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? labels.formSubmitting : labels.formSubmit}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-border/70 bg-white px-4 text-sm font-medium shadow-sm"
            >
              {labels.formCancel}
            </button>
          </div>
        </div>
      ) : null}

      {issues.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{labels.empty}</p>
      ) : (
        <div className={tableWrapClass}>
          <table className="w-full min-w-[56rem] table-fixed border-collapse text-sm">
            <colgroup>
              <col style={{ width: "16%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "27%" }} />
            </colgroup>
            <thead>
              <tr className="bg-surface-50/90 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-3 py-3.5 align-bottom sm:px-4">
                  {labels.colBranch}
                </th>
                <th className="px-3 py-3.5 align-bottom sm:px-4">
                  {labels.colReportedAt}
                </th>
                <th className="px-3 py-3.5 align-bottom sm:px-4">
                  {labels.colReporter}
                </th>
                <th className="px-3 py-3.5 align-bottom sm:px-4">
                  {labels.colSeverity}
                </th>
                <th className="px-3 py-3.5 align-bottom sm:px-4">
                  {labels.colSummary}
                </th>
                <th className="px-3 py-3.5 align-bottom sm:px-4">
                  {labels.colDetail}
                </th>
              </tr>
            </thead>
            <tbody className="text-[15px]">
              {sortedIssues.map((row) => (
                <tr
                  key={row.id}
                  className="align-top transition-colors hover:bg-brand-subtle/25"
                >
                  <td className="min-w-0 px-3 py-3.5 align-top sm:px-4">
                    <span className="block font-semibold leading-snug text-foreground">
                      {branchLabel(row.branch_id)}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted">
                      {row.branch_id}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 align-top tabular-nums text-muted sm:px-4">
                    <span className="block whitespace-normal break-words leading-snug">
                      {new Date(row.reported_at).toLocaleString(dateLocale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="min-w-0 px-3 py-3.5 align-top text-foreground sm:px-4">
                    <span className="block break-words leading-snug">
                      {reporterDisplay(row)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 align-top sm:px-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${severityClass(row.severity)}`}
                    >
                      {severityLabel(row.severity)}
                    </span>
                  </td>
                  <td className="min-w-0 px-3 py-3.5 align-top font-medium text-foreground sm:px-4">
                    <span className="block break-words leading-snug">
                      {row.summary}
                    </span>
                  </td>
                  <td className="min-w-0 px-3 py-3.5 align-top text-muted sm:px-4">
                    {row.detail ? (
                      <span className="block whitespace-pre-wrap break-words leading-snug">
                        {row.detail}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportSectionCard>
  );
}
