"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { adminEn, adminTh, type AdminLocale, type AdminTranslations } from "./translations";

const STORAGE_KEY = "admin-lang";

const map: Record<AdminLocale, AdminTranslations> = {
  th: adminTh,
  en: adminEn as unknown as AdminTranslations,
};

type Ctx = {
  locale: AdminLocale;
  setLocale: (l: AdminLocale) => void;
  t: AdminTranslations;
};

const AdminLanguageContext = createContext<Ctx>({
  locale: "th",
  setLocale: () => {},
  t: adminTh,
});

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>("th");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AdminLocale | null;
    if (saved === "en" || saved === "th") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: AdminLocale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = map[locale];

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <AdminLanguageContext.Provider value={value}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  return useContext(AdminLanguageContext);
}
