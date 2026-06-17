import { UserRole } from "@/generated/prisma/client";
import { hasRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export class BotAuthError extends Error {
  constructor(
    message: string,
    readonly code:
      | "BOT_UNAUTHORIZED"
      | "DISCORD_ID_REQUIRED"
      | "ACCOUNT_NOT_LINKED"
      | "BANNED"
      | "FORBIDDEN",
  ) {
    super(message);
    this.name = "BotAuthError";
  }
}

export function getBotApiSecret(): string | null {
  return process.env.BOT_API_SECRET ?? process.env.DISCORD_BOT_TOKEN ?? null;
}

export function verifyBotAuthorization(request: Request): boolean {
  const secret = getBotApiSecret();
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;

  return header.slice("Bearer ".length) === secret;
}

export async function requireBotUser(request: Request, requiredRole: UserRole = "PLAYER") {
  if (!verifyBotAuthorization(request)) {
    throw new BotAuthError("Invalid bot credentials", "BOT_UNAUTHORIZED");
  }

  const discordId = request.headers.get("x-discord-user-id")?.trim();
  if (!discordId) {
    throw new BotAuthError("Missing X-Discord-User-Id header", "DISCORD_ID_REQUIRED");
  }

  const user = await prisma.user.findUnique({
    where: { discordId },
    include: { player: true },
  });

  if (!user) {
    throw new BotAuthError(
      "Link your Discord account at https://bscl.gg/login first",
      "ACCOUNT_NOT_LINKED",
    );
  }

  if (user.banned) {
    throw new BotAuthError("Account banned", "BANNED");
  }

  if (!hasRole(user.role, requiredRole)) {
    throw new BotAuthError("Insufficient role", "FORBIDDEN");
  }

  return user;
}
