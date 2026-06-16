/** True when DATABASE_URL and AUTH_SECRET are both configured. */
export function isBackendEnabled(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() && process.env.AUTH_SECRET?.trim(),
  );
}

export const DEMO_COOKIE = "bscl_demo";

/** Force demo via env (useful when backend is configured locally). */
export function isDemoModeForced(): boolean {
  return process.env.BSCL_DEMO === "1" || process.env.NEXT_PUBLIC_BSCL_DEMO === "1";
}

/**
 * Demo / prototype mode — localStorage journey, simulated Discord, no real OAuth.
 * Active when backend is off, BSCL_DEMO=1, or the bscl_demo cookie is set.
 */
export function isDemoMode(demoCookieValue?: string | null): boolean {
  if (!isBackendEnabled()) return true;
  if (isDemoModeForced()) return true;
  return demoCookieValue === "1";
}
