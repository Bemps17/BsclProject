/** Content-Security-Policy for HTML pages (no `unsafe-eval`). */
export function buildContentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://discord.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.discordapp.com",
    "font-src 'self' data:",
    "connect-src 'self' https://discord.com https://discordapp.com",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}
