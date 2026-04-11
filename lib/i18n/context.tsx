"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { th } from "./translations/th";
import { en } from "./translations/en";
import { cn } from "./translations/cn";

export type Locale = "th" | "en" | "cn";
export type Translations = typeof th;

const translationMap: Record<Locale, Translations> = { th, en, cn };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "th",
  setLocale: () => {},
  t: th,
});

const STORAGE_KEY = "spr-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && translationMap[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l === "cn" ? "zh" : l;
  }, []);

  const t = translationMap[locale];

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
