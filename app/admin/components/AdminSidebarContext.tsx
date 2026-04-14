"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "admin-sidebar-desktop-collapsed";

type AdminSidebarContextValue = {
  desktopCollapsed: boolean;
  toggleDesktopSidebar: () => void;
  setDesktopCollapsed: (collapsed: boolean) => void;
};

const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(
  null,
);

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setDesktopCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, desktopCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [desktopCollapsed, hydrated]);

  const toggleDesktopSidebar = useCallback(() => {
    setDesktopCollapsed((c) => !c);
  }, []);

  const value = useMemo(
    () => ({
      desktopCollapsed,
      toggleDesktopSidebar,
      setDesktopCollapsed,
    }),
    [desktopCollapsed, toggleDesktopSidebar],
  );

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar(): AdminSidebarContextValue {
  const ctx = useContext(AdminSidebarContext);
  if (!ctx) {
    throw new Error("useAdminSidebar must be used within AdminSidebarProvider");
  }
  return ctx;
}

/** For components that may render outside the dashboard layout (e.g. shared Header). */
export function useAdminSidebarOptional(): AdminSidebarContextValue | null {
  return useContext(AdminSidebarContext);
}
