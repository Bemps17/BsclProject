import { UserRole } from "@/generated/prisma/client";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  PLAYER: 0,
  CAPTAIN: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}
