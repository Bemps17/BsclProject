import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/client";
import { isBackendEnabled } from "@/lib/backend";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";

export async function getSessionUser() {
  if (!isBackendEnabled()) return null;

  let session;
  try {
    session = await auth();
  } catch {
    return null;
  }
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { player: true },
  });

  return user;
}

export { hasRole } from "@/lib/roles";

export async function requireAuth(requiredRole: UserRole = "PLAYER") {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.banned) {
    throw new Error("BANNED");
  }
  if (!hasRole(user.role, requiredRole)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
