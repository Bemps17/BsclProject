"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  getTranslations,
  LOCALE_STORAGE_KEY,
  type Locale,
  type Translations,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "fr" ? "fr" : "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: getTranslations(locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useT(): Translations {
  return useLocale().t;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-full border border-[#1E2D45] bg-[#162032] p-0.5 text-[9px] font-bold uppercase tracking-wide sm:text-[10px]",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {(["en", "fr"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            "min-w-[26px] rounded-full px-1.5 py-0.5 transition-colors sm:min-w-[34px] sm:px-2 sm:py-1",
            locale === code
              ? "bg-[#0066FF] text-white shadow-[0_0_8px_rgba(0,102,255,.28)]"
              : "text-[#6B7280] hover:text-[#E5E7EB]",
          )}
          aria-pressed={locale === code}
        >
          {code === "en" ? "ENG" : "FR"}
        </button>
      ))}
    </div>
  );
}
