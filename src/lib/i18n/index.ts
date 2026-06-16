import { en } from "./en";
import { fr } from "./fr";
import type { Locale, Translations } from "./types";

export type { Locale, Translations } from "./types";

export const LOCALE_STORAGE_KEY = "bscl-locale";

export const translations: Record<Locale, Translations> = { en, fr };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function formatCount(n: number, locale: Locale): string {
  return n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US");
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
