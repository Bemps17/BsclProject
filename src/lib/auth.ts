import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  PLAYER: 0,
  CAPTAIN: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { player: true },
  });

  return user;
}

export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

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
