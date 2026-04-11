"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "mxth_pos_staff";

type Ctx = {
  staffLabel: string | null;
  branchId: string | null;
  setSession: (staff: string, branchId: string) => void;
  logout: () => void;
};

const PosMockAuthContext = createContext<Ctx | null>(null);

export function PosMockAuthProvider({ children }: { children: React.ReactNode }) {
  const [staffLabel, setStaffLabel] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const j = JSON.parse(raw) as { staff: string; branch: string };
        setStaffLabel(j.staff);
        setBranchId(j.branch);
      }
    } catch {
      setStaffLabel(null);
      setBranchId(null);
    }
  }, []);

  const setSession = useCallback((staff: string, branch: string) => {
    setStaffLabel(staff);
    setBranchId(branch);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ staff, branch }));
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    setStaffLabel(null);
    setBranchId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ staffLabel, branchId, setSession, logout }),
    [staffLabel, branchId, setSession, logout],
  );

  return (
    <PosMockAuthContext.Provider value={value}>{children}</PosMockAuthContext.Provider>
  );
}

export function usePosMockAuth() {
  const ctx = useContext(PosMockAuthContext);
  if (!ctx) {
    throw new Error("usePosMockAuth must be used within provider");
  }
  return ctx;
}
