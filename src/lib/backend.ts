/** True when DATABASE_URL and AUTH_SECRET are both configured. */
export function isBackendEnabled(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() && process.env.AUTH_SECRET?.trim(),
  );
}
