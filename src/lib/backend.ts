/** True when DATABASE_URL and AUTH_SECRET are both configured. */
export function isBackendEnabled(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() && process.env.AUTH_SECRET?.trim(),
  );
}

export const DEMO_COOKIE = "bscl_demo";

/** NextAuth session cookies (database / JWT strategies). */
export const AUTH_SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
] as const;

export function hasAuthSessionCookie(
  getCookie: (name: string) => string | undefined,
): boolean {
  return AUTH_SESSION_COOKIES.some((name) => Boolean(getCookie(name)));
}

/** Force demo via env (useful when backend is configured locally). */
export function isDemoModeForced(): boolean {
  return process.env.BSCL_DEMO === "1" || process.env.NEXT_PUBLIC_BSCL_DEMO === "1";
}

/**
 * Demo / prototype mode — localStorage journey, simulated Discord, no real OAuth.
 * Active when BSCL_DEMO=1 or the bscl_demo cookie is set (explicit user choice).
 */
export function isDemoMode(demoCookieValue?: string | null): boolean {
  if (isDemoModeForced()) return true;
  return demoCookieValue === "1";
}

/** Whether the visitor may access platform routes (competitive session or demo cookie). */
export function hasPlatformAccess(options: {
  demoCookie?: string | null;
  getSessionCookie?: (name: string) => string | undefined;
}): boolean {
  if (options.getSessionCookie && hasAuthSessionCookie(options.getSessionCookie)) {
    return true;
  }
  return isDemoMode(options.demoCookie);
}
