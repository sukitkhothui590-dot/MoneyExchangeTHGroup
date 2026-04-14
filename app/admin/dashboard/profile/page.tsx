"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import AdminPageHelp from "../../components/AdminPageHelp";
import { CameraIcon, PencilIcon } from "@heroicons/react/24/outline";
import type { Profile } from "@/lib/types/database";
import { useAdminLanguage } from "@/lib/admin/AdminLanguageProvider";

export default function ProfilePage() {
  const { t } = useAdminLanguage();
  const p = t.pages.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editValues, setEditValues] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const json = await res.json();
        setProfile(json.data ?? null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const startEdit = () => {
    setEditValues({
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      if (res.ok) {
        const json = await res.json();
        setProfile(json.data ?? null);
        setIsEditing(false);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (loading) {
    return (
      <>
        <Header title={p.title} subtitle={p.subtitle} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AdminPageHelp
            idPrefix="profile"
            title={p.helpTitle}
            expandLabel={t.common.helpExpand}
            collapseLabel={t.common.helpCollapse}
            sections={p.helpSections}
          />
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted">{t.common.loadingData}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={p.title} subtitle={p.subtitle} />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <AdminPageHelp
          idPrefix="profile"
          title={p.helpTitle}
          expandLabel={t.common.helpExpand}
          collapseLabel={t.common.helpCollapse}
          sections={p.helpSections}
        />
        <div className="max-w-xl">
          {/* Avatar */}
          <div className="bg-white border border-border rounded-xl p-5 mb-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-xl font-bold text-white">
                  {initials}
                </div>
                <button className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-white border border-border rounded-full flex items-center justify-center text-muted hover:text-foreground transition-colors cursor-pointer">
                  <CameraIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {profile?.name ?? "—"}
                </h2>
                <p className="text-xs text-brand font-medium">
                  {profile?.role ?? "admin"}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  เข้าร่วมเมื่อ{" "}
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white border border-border rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                ข้อมูลส่วนตัว
              </h3>
              {!isEditing && (
                <button
                  onClick={startEdit}
                  className="h-7 px-2.5 border border-border text-[11px] font-medium text-muted rounded-lg hover:text-brand hover:border-brand transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <PencilIcon className="w-3 h-3" />
                  แก้ไข
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    value={editValues.name}
                    onChange={(e) =>
                      setEditValues({ ...editValues, name: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    อีเมล
                  </label>
                  <input
                    value={editValues.email}
                    onChange={(e) =>
                      setEditValues({ ...editValues, email: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    value={editValues.phone}
                    onChange={(e) =>
                      setEditValues({ ...editValues, phone: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground transition-colors hover:border-border-strong focus:border-brand"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="h-9 px-4 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="h-9 px-4 bg-brand text-white rounded-lg text-xs font-medium hover:bg-brand-dark transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "กำลังบันทึก..." : "บันทึก"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "ชื่อ-นามสกุล", value: profile?.name ?? "—" },
                  { label: "อีเมล", value: profile?.email ?? "—" },
                  { label: "เบอร์โทรศัพท์", value: profile?.phone ?? "—" },
                  {
                    label: "บทบาท",
                    value: profile?.role ?? "admin",
                    accent: true,
                  },
                ].map((f) => (
                  <div key={f.label} className="bg-surface rounded-lg p-3">
                    <p className="text-[11px] text-muted mb-0.5">{f.label}</p>
                    <p
                      className={`text-sm font-medium ${f.accent ? "text-brand" : "text-foreground"}`}
                    >
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              ความปลอดภัย
            </h3>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm text-foreground">รหัสผ่าน</p>
                  <p className="text-[11px] text-muted">
                    เปลี่ยนล่าสุด 15 ก.พ. 2026
                  </p>
                </div>
                <button className="h-7 px-2.5 border border-border text-[11px] font-medium text-muted rounded-lg hover:text-foreground hover:border-border-strong transition-colors cursor-pointer">
                  เปลี่ยน
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-foreground">
                    การยืนยันตัวตน 2 ขั้นตอน
                  </p>
                  <p className="text-[11px] text-muted">
                    เพิ่มความปลอดภัยให้บัญชี
                  </p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-200">
                  ปิดอยู่
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
