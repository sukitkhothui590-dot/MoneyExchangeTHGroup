"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";
import type { Branch } from "@/lib/types/database";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  branch_ids: string[];
}

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "staff";
  staffBranchIds: string[];
}

interface ResetState {
  userId: string;
  userName: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminUsersPage() {
  const { t } = useAdminLanguage();
  const p = t.pages.adminUsers;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    staffBranchIds: [],
  });

  const [branchEditUser, setBranchEditUser] = useState<AdminUser | null>(null);
  const [branchEditIds, setBranchEditIds] = useState<string[]>([]);
  const [branchEditSaving, setBranchEditSaving] = useState(false);
  const [branchEditError, setBranchEditError] = useState("");

  // Reset password modal
  const [resetState, setResetState] = useState<ResetState | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data ?? []);
      } else {
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const json = await res.json();
        setAllBranches((json.data ?? []) as Branch[]);
      }
    })();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Add user ──────────────────────────────────────────────────────────────
  const openAddModal = () => {
    const first = allBranches[0]?.id;
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      staffBranchIds: first ? [first] : [],
    });
    setAddError("");
    setShowAddModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (form.password !== form.confirmPassword) {
      setAddError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (form.password.length < 6) {
      setAddError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (form.role === "staff" && form.staffBranchIds.length === 0) {
      setAddError("เลือกอย่างน้อยหนึ่งสาขาสำหรับพนักงาน POS");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          branch_ids: form.role === "staff" ? form.staffBranchIds : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAddError(json.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setShowAddModal(false);
      fetchUsers();
    } catch {
      setAddError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setAdding(false);
    }
  };

  // ── Reset password ────────────────────────────────────────────────────────
  const openReset = (user: AdminUser) => {
    setResetState({
      userId: user.id,
      userName: user.name || user.email,
      newPassword: "",
      confirmPassword: "",
    });
    setResetError("");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetState) return;
    setResetError("");

    if (resetState.newPassword !== resetState.confirmPassword) {
      setResetError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (resetState.newPassword.length < 6) {
      setResetError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`/api/admin-users/${resetState.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: resetState.newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResetError(json.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setResetState(null);
    } catch {
      setResetError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setResetting(false);
    }
  };

  // ── Delete user ───────────────────────────────────────────────────────────
  const saveBranchAssignments = async () => {
    if (!branchEditUser || branchEditIds.length === 0) {
      setBranchEditError("เลือกอย่างน้อยหนึ่งสาขา");
      return;
    }
    setBranchEditSaving(true);
    setBranchEditError("");
    try {
      const res = await fetch(`/api/admin-users/${branchEditUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_ids: branchEditIds }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBranchEditError(json.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setBranchEditUser(null);
      fetchUsers();
    } catch {
      setBranchEditError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setBranchEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin-users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Header title={p.title} subtitle={p.subtitle} />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <AdminPageHelp
          idPrefix="admin-users"
          title={p.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={p.helpSections}
        />
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="ค้นหาผู้ดูแลระบบ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/50 transition-colors hover:border-border-strong"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 h-10 px-4 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand/90 transition-colors cursor-pointer shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            เพิ่มผู้ดูแลระบบ
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    ชื่อ / อีเมล
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    สิทธิ์ / สาขา
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    เข้าสู่ระบบล่าสุด
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted">
                    วันที่สร้าง
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-muted">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-muted"
                    >
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-muted"
                    >
                      ไม่พบผู้ดูแลระบบ
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border last:border-b-0 hover:bg-surface/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center text-sm font-semibold shrink-0">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {u.name || "—"}
                            </p>
                            <p className="text-xs text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-brand-subtle text-brand border-brand/20">
                          {u.role}
                        </span>
                        {u.role === "staff" ? (
                          <p className="text-[11px] text-muted mt-1 max-w-[200px]">
                            {u.branch_ids?.length
                              ? `${u.branch_ids.length} สาขา`
                              : "ยังไม่มีสาขา"}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-muted text-xs">
                        {formatDate(u.last_sign_in_at)}
                      </td>
                      <td className="px-5 py-3.5 text-muted text-xs">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          {u.role === "staff" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setBranchEditUser(u);
                                setBranchEditIds([...(u.branch_ids ?? [])]);
                                setBranchEditError("");
                              }}
                              title="มอบหมายสาขา"
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:text-brand hover:border-brand transition-colors cursor-pointer text-[10px] font-semibold"
                            >
                              สาขา
                            </button>
                          ) : null}
                          <button
                            onClick={() => openReset(u)}
                            title="รีเซ็ตรหัสผ่าน"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:text-brand hover:border-brand transition-colors cursor-pointer"
                          >
                            <KeyIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            title="ลบบัญชี"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:text-danger hover:border-danger transition-colors cursor-pointer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted mt-3">
          แสดง {filtered.length} จาก {users.length} บัญชี
        </p>
      </div>

      {/* ── Add Admin Modal ──────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white border border-border rounded-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">
                เพิ่มบัญชีพนักงาน / แอดมิน
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ชื่อ
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="ชื่อผู้ดูแลระบบ"
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  อีเมล <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="admin@example.com"
                  required
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  บทบาท
                </label>
                <select
                  value={form.role}
                  onChange={(e) => {
                    const role = e.target.value === "staff" ? "staff" : "admin";
                    setForm((f) => ({
                      ...f,
                      role,
                      staffBranchIds:
                        role === "staff"
                          ? f.staffBranchIds.length > 0
                            ? f.staffBranchIds
                            : allBranches[0]?.id
                              ? [allBranches[0].id]
                              : []
                          : [],
                    }));
                  }}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong focus:border-brand outline-none"
                >
                  <option value="admin">แอดมิน (เต็ม)</option>
                  <option value="staff">พนักงาน POS</option>
                </select>
                <p className="text-xs text-muted mt-1">
                  พนักงานเข้าได้เฉพาะ /pos ไม่เข้าแผงแอดมิน — ต้องมอบหมายสาขาอย่างน้อย 1 สาขา
                </p>
              </div>

              {form.role === "staff" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    สาขาที่ใช้ได้ <span className="text-danger">*</span>
                  </label>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-surface/40 px-3 py-2 space-y-2">
                    {allBranches.filter((b) => b.status === "active").length ===
                    0 ? (
                      <p className="text-xs text-muted">ไม่มีสาขาในระบบ</p>
                    ) : (
                      allBranches
                        .filter((b) => b.status === "active")
                        .map((b) => (
                          <label
                            key={b.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={form.staffBranchIds.includes(b.id)}
                              onChange={(e) => {
                                setForm((f) => {
                                  const next = e.target.checked
                                    ? [...f.staffBranchIds, b.id]
                                    : f.staffBranchIds.filter((x) => x !== b.id);
                                  return { ...f, staffBranchIds: next };
                                });
                              }}
                              className="rounded border-border"
                            />
                            <span>{b.name_th}</span>
                          </label>
                        ))
                    )}
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  รหัสผ่าน <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ยืนยันรหัสผ่าน <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  required
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand outline-none"
                />
              </div>

              {addError && (
                <p className="text-xs text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 h-10 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {adding ? "กำลังสร้าง..." : "สร้างบัญชี"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Staff branch assignments ───────────────────────────────── */}
      {branchEditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white border border-border rounded-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  มอบหมายสาขา (พนักงาน POS)
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {branchEditUser.name || branchEditUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBranchEditUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto rounded-lg border border-border bg-surface/40 px-3 py-2 mb-4">
              {allBranches
                .filter((b) => b.status === "active")
                .map((b) => (
                  <label
                    key={b.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={branchEditIds.includes(b.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBranchEditIds((ids) => [...ids, b.id]);
                        } else {
                          setBranchEditIds((ids) =>
                            ids.filter((x) => x !== b.id),
                          );
                        }
                      }}
                      className="rounded border-border"
                    />
                    <span>{b.name_th}</span>
                  </label>
                ))}
            </div>
            {branchEditError ? (
              <p className="text-xs text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {branchEditError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBranchEditUser(null)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={branchEditSaving}
                onClick={() => void saveBranchAssignments()}
                className="flex-1 h-10 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors cursor-pointer disabled:opacity-60"
              >
                {branchEditSaving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ─────────────────────────────────────── */}
      {resetState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white border border-border rounded-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  รีเซ็ตรหัสผ่าน
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {resetState.userName}
                </p>
              </div>
              <button
                onClick={() => setResetState(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  รหัสผ่านใหม่ <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={resetState.newPassword}
                  onChange={(e) =>
                    setResetState((s) =>
                      s ? { ...s, newPassword: e.target.value } : s,
                    )
                  }
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  required
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ยืนยันรหัสผ่านใหม่ <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={resetState.confirmPassword}
                  onChange={(e) =>
                    setResetState((s) =>
                      s ? { ...s, confirmPassword: e.target.value } : s,
                    )
                  }
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  required
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted/40 transition-colors hover:border-border-strong focus:border-brand outline-none"
                />
              </div>

              {resetError && (
                <p className="text-xs text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {resetError}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResetState(null)}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 h-10 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {resetting ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white border border-border rounded-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-foreground mb-2">
              ยืนยันการลบบัญชี
            </h2>
            <p className="text-sm text-muted mb-1">
              คุณต้องการลบบัญชีของ{" "}
              <span className="font-medium text-foreground">
                {deleteTarget.name || deleteTarget.email}
              </span>{" "}
              ใช่หรือไม่?
            </p>
            <p className="text-xs text-danger mb-5">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting ? "กำลังลบ..." : "ลบบัญชี"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
