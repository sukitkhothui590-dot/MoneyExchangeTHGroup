"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import type { Branch } from "@/lib/types/database";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

interface FormState {
  id: string;
  name: string;
  name_th: string;
  address: string;
  address_th: string;
  address_cn: string;
  hours: string;
  hours_th: string;
  hours_cn: string;
  status: "active" | "inactive";
}

const emptyForm: FormState = {
  id: "",
  name: "",
  name_th: "",
  address: "",
  address_th: "",
  address_cn: "",
  hours: "",
  hours_th: "",
  hours_cn: "",
  status: "active",
};

export default function BranchesPage() {
  const { t } = useAdminLanguage();
  const p = t.pages.branches;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Add / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const json = await res.json();
        setBranches(json.data ?? []);
      } else {
        setError("ไม่สามารถโหลดข้อมูลสาขาได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.name_th.includes(search) ||
      b.id.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Open add modal ────────────────────────────────────────────────────────
  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowModal(true);
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEditModal = (branch: Branch) => {
    setForm({
      id: branch.id,
      name: branch.name,
      name_th: branch.name_th,
      address: branch.address,
      address_th: branch.address_th,
      address_cn: branch.address_cn,
      hours: branch.hours,
      hours_th: branch.hours_th,
      hours_cn: branch.hours_cn,
      status: branch.status,
    });
    setEditingId(branch.id);
    setFormError("");
    setShowModal(true);
  };

  // ── Submit add / edit ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.name_th.trim()) {
      setFormError("กรุณากรอกชื่อสาขา (EN และ TH)");
      return;
    }

    if (!editingId && !form.id.trim()) {
      setFormError("กรุณากรอก ID สาขา");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing
        const res = await fetch(`/api/branches/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            name_th: form.name_th,
            address: form.address,
            address_th: form.address_th,
            address_cn: form.address_cn,
            hours: form.hours,
            hours_th: form.hours_th,
            hours_cn: form.hours_cn,
            status: form.status,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setFormError(json.error ?? "เกิดข้อผิดพลาด");
          return;
        }
      } else {
        // Create new
        const res = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) {
          setFormError(json.error ?? "เกิดข้อผิดพลาด");
          return;
        }
      }
      setShowModal(false);
      fetchBranches();
    } catch {
      setFormError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/branches/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setDeleteTarget(null);
      fetchBranches();
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header title={p.titleLoading} subtitle={p.subtitleLoading} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted">{t.common.loadingData}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={p.title}
        subtitle={p.subtitle}
        actions={
          <button
            onClick={openAddModal}
            className="h-9 px-3.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            เพิ่มสาขา
          </button>
        }
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="ค้นหาสาขา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    ชื่อ (EN)
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    ชื่อ (TH)
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    ที่อยู่
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    เวลาทำการ
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-muted">
                    สถานะ
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-muted">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((branch) => (
                  <tr
                    key={branch.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {branch.name}
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {branch.name_th}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs max-w-[220px] truncate">
                      {branch.address || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">
                      {branch.hours || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {branch.status === "active" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          เปิดบริการ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                          ปิดบริการ
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(branch)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-brand hover:border-brand transition-colors cursor-pointer"
                          title="แก้ไข"
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(branch)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                          title="ลบ"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-muted"
                    >
                      {search
                        ? `ไม่พบสาขาที่ค้นหา "${search}"`
                        : "ยังไม่มีข้อมูลสาขา"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white border border-border rounded-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "แก้ไขสาขา" : "เพิ่มสาขาใหม่"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ID — only on create */}
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    ID สาขา (slug)
                  </label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        id: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    placeholder="เช่น silom, central-world"
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
                    required
                  />
                  <p className="mt-1 text-xs text-muted">
                    ใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลาง
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    ชื่อสาขา (EN)
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Silom"
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    ชื่อสาขา (TH)
                  </label>
                  <input
                    type="text"
                    value={form.name_th}
                    onChange={(e) =>
                      setForm({ ...form, name_th: e.target.value })
                    }
                    placeholder="สีลม"
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ที่อยู่ (EN)
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="No. 491/5-491/7 Silom Plaza, Silom Road..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ที่อยู่ (TH)
                </label>
                <textarea
                  value={form.address_th}
                  onChange={(e) =>
                    setForm({ ...form, address_th: e.target.value })
                  }
                  placeholder="เลขที่ 491/5-491/7 อาคารสีลมพลาซ่า ถนนสีลม..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ที่อยู่ (CN)
                </label>
                <textarea
                  value={form.address_cn}
                  onChange={(e) =>
                    setForm({ ...form, address_cn: e.target.value })
                  }
                  placeholder="491/5-491/7号 是隆广场大厦..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    เวลาทำการ (EN)
                  </label>
                  <input
                    type="text"
                    value={form.hours}
                    onChange={(e) =>
                      setForm({ ...form, hours: e.target.value })
                    }
                    placeholder="09:00 – 20:00"
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    เวลาทำการ (TH)
                  </label>
                  <input
                    type="text"
                    value={form.hours_th}
                    onChange={(e) =>
                      setForm({ ...form, hours_th: e.target.value })
                    }
                    placeholder="09:00 – 20:00"
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    เวลาทำการ (CN)
                  </label>
                  <input
                    type="text"
                    value={form.hours_cn}
                    onChange={(e) =>
                      setForm({ ...form, hours_cn: e.target.value })
                    }
                    placeholder="09:00 – 20:00"
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  สถานะ
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong cursor-pointer"
                >
                  <option value="active">เปิดบริการ</option>
                  <option value="inactive">ปิดบริการ</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-10 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? "กำลังบันทึก..."
                    : editingId
                      ? "บันทึกการแก้ไข"
                      : "เพิ่มสาขา"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white border border-border rounded-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              ยืนยันการลบ
            </h2>
            <p className="text-sm text-muted mb-5">
              ต้องการลบสาขา{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget.name} ({deleteTarget.name_th})
              </span>{" "}
              หรือไม่? มาร์จิ้นเฉพาะสาขาทั้งหมดจะถูกลบไปด้วย
              ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "กำลังลบ..." : "ลบสาขา"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
