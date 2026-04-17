"use client";

import { useCallback, useEffect, useState } from "react";

export type PosBranchIssueRow = {
  id: string;
  branch_id: string;
  summary: string;
  detail: string;
  severity: "low" | "medium" | "high";
  reported_at: string;
  created_by?: string | null;
  reporter_name?: string | null;
};

function senderLabel(r: PosBranchIssueRow): string {
  const n = r.reporter_name?.trim();
  if (n) return n;
  const cid = r.created_by?.trim();
  if (cid) return `ผู้ใช้ ${cid.slice(0, 8)}…`;
  return "—";
}

function severityBadge(sev: PosBranchIssueRow["severity"]) {
  if (sev === "high") {
    return "bg-red-100 text-red-900 ring-red-200";
  }
  if (sev === "medium") {
    return "bg-amber-100 text-amber-950 ring-amber-200";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function severityLabel(sev: PosBranchIssueRow["severity"]) {
  if (sev === "high") return "สูง";
  if (sev === "medium") return "ปานกลาง";
  return "ต่ำ";
}

export function PosBranchIssuesPanel({
  branchId,
  branchNameTh,
}: {
  branchId: string | undefined;
  branchNameTh: string;
}) {
  const [rows, setRows] = useState<PosBranchIssueRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [severity, setSeverity] =
    useState<PosBranchIssueRow["severity"]>("medium");

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `/api/pos/branch-issues?branchId=${encodeURIComponent(branchId)}`,
      );
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error ?? "โหลดไม่สำเร็จ");
        setRows([]);
        return;
      }
      setRows((json.data as PosBranchIssueRow[]) ?? []);
    } catch {
      setErr("เกิดข้อผิดพลาด");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!branchId) return;
    const s = summary.trim();
    if (!s) {
      setErr("กรุณากรอกหัวข้อ");
      return;
    }
    setSubmitting(true);
    setErr("");
    setOk("");
    try {
      const res = await fetch("/api/pos/branch-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: branchId,
          summary: s,
          detail: detail.trim(),
          severity,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setSummary("");
      setDetail("");
      setSeverity("medium");
      setOk("ส่งเรื่องแล้ว — ทีมหลังบ้านจะเห็นในรายงานสาขา");
      void load();
    } catch {
      setErr("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  if (!branchId) {
    return (
      <section
        id="branch-issues"
        className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-600"
      >
        เลือกสาขาในแถบด้านบนก่อน จึงจะแจ้งปัญหาได้
      </section>
    );
  }

  return (
    <section
      id="branch-issues"
      className="scroll-mt-4 space-y-4 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 to-white pos-card-saas p-4 sm:p-5 shadow-sm"
    >
      <div className="border-l-4 border-amber-500 pl-3 min-w-0">
        <h2 className="text-base font-semibold text-slate-900">
          แจ้งปัญหา / เหตุการณ์ที่สาขา
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          สาขา{" "}
          <span className="font-medium text-slate-900">{branchNameTh}</span>{" "}
          — หัวข้อสั้นๆ และรายละเอียดถ้ามี (แสดงชื่อผู้บันทึกในรายงานหลังบ้าน)
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">หัวข้อ</span>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="เช่น เครื่องนับเงินขัดข้อง, ลูกค้าแจ้งเรทไม่ตรง..."
            maxLength={500}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-800">ระดับความเร่งด่วน</span>
          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value as PosBranchIssueRow["severity"])
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm"
          >
            <option value="low">ต่ำ</option>
            <option value="medium">ปานกลาง</option>
            <option value="high">สูง</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-800">รายละเอียด (ถ้ามี)</span>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            maxLength={4000}
            placeholder="สิ่งที่เกิดขึ้น วิธีแก้ชั่วคราว ชื่อลูกค้า/เวลา ฯลฯ"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm"
          />
        </label>
      </div>

      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {ok}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-amber-800 disabled:opacity-50"
        >
          {submitting ? "กำลังส่ง…" : "ส่งแจ้งปัญหา"}
        </button>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "กำลังโหลดรายการ…" : "รีเฟรชรายการ"}
        </button>
      </div>

      <div className="border-t border-amber-200/80 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          รายการที่สาขานี้แจ้งล่าสุด
        </h3>
        {loading && rows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">กำลังโหลด…</p>
        ) : rows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            ยังไม่มีบันทึก — เรื่องที่ส่งจะแสดงที่นี่
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2.5 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${severityBadge(r.severity)}`}
                  >
                    {severityLabel(r.severity)}
                  </span>
                  <time
                    className="text-xs text-slate-500 tabular-nums"
                    dateTime={r.reported_at}
                  >
                    {new Date(r.reported_at).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  <span className="text-xs text-slate-600">
                    <span className="text-slate-400">ผู้ส่ง</span>{" "}
                    <span className="font-medium text-slate-800">
                      {senderLabel(r)}
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 font-medium text-slate-900">{r.summary}</p>
                {r.detail ? (
                  <p className="mt-1 whitespace-pre-wrap text-slate-600">
                    {r.detail}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
