"use client";

import { createClient } from "@/lib/supabase/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const BRANCH_KEY = "mxth_pos_branch";

export type PosBranchSelection = { id: string; name_th: string };

export type PosAccess = {
  role: "admin" | "staff";
  allowedBranches: PosBranchSelection[];
};

type Ctx = {
  ready: boolean;
  branch: PosBranchSelection | null;
  setBranch: (b: PosBranchSelection) => void;
  clearBranch: () => void;
  userEmail: string | null;
  /** ชื่อจาก profiles.name (สำหรับทักทายใน UI) */
  userDisplayName: string | null;
  /** สิทธิ์ POS + สาขาที่ใช้ได้ (หลังโหลด /api/pos/me) */
  posAccess: PosAccess | null;
  refreshUser: () => Promise<void>;
};

const PosSessionContext = createContext<Ctx | null>(null);

function readBranch(): PosBranchSelection | null {
  try {
    const raw = localStorage.getItem(BRANCH_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as PosBranchSelection;
    if (j?.id && j?.name_th) return { id: j.id, name_th: j.name_th };
  } catch {
    /* ignore */
  }
  return null;
}

export function PosSessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [branch, setBranchState] = useState<PosBranchSelection | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [posAccess, setPosAccess] = useState<PosAccess | null>(null);

  const refreshUser = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserEmail(user?.email ?? null);
    if (!user) {
      setUserDisplayName(null);
      setPosAccess(null);
      return;
    }
    const { data: prof } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();
    setUserDisplayName(prof?.name?.trim() || null);

    const meRes = await fetch("/api/pos/me");
    if (meRes.ok) {
      const meJson = await meRes.json();
      const list = (meJson.data?.allowedBranches ?? []) as PosBranchSelection[];
      setPosAccess({
        role: meJson.data.role,
        allowedBranches: list,
      });
    } else {
      setPosAccess(null);
    }
  }, []);

  useEffect(() => {
    setBranchState(readBranch());
    void refreshUser();
    setReady(true);

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshUser();
    });
    return () => subscription.unsubscribe();
  }, [refreshUser]);

  const setBranch = useCallback((b: PosBranchSelection) => {
    setBranchState(b);
    try {
      localStorage.setItem(BRANCH_KEY, JSON.stringify(b));
    } catch {
      /* ignore */
    }
  }, []);

  const clearBranch = useCallback(() => {
    setBranchState(null);
    try {
      localStorage.removeItem(BRANCH_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!posAccess?.allowedBranches?.length) return;
    const allowed = posAccess.allowedBranches;
    setBranchState((current) => {
      const raw = current ?? readBranch();
      if (raw && allowed.some((b) => b.id === raw.id)) return raw;
      const first = allowed[0];
      const next = { id: first.id, name_th: first.name_th };
      try {
        localStorage.setItem(BRANCH_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [posAccess]);

  const value = useMemo(
    () => ({
      ready,
      branch,
      setBranch,
      clearBranch,
      userEmail,
      userDisplayName,
      posAccess,
      refreshUser,
    }),
    [ready, branch, setBranch, clearBranch, userEmail, userDisplayName, posAccess, refreshUser],
  );

  return (
    <PosSessionContext.Provider value={value}>{children}</PosSessionContext.Provider>
  );
}

export function usePosSession() {
  const ctx = useContext(PosSessionContext);
  if (!ctx) {
    throw new Error("usePosSession must be used within PosSessionProvider");
  }
  return ctx;
}
