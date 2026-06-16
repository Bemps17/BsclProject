import { z } from "zod";

export const teamTagSchema = z
  .string()
  .trim()
  .min(2, "Tag must be at least 2 characters")
  .max(4, "Tag must be at most 4 characters")
  .regex(/^[A-Z0-9]+$/, "Tag must be uppercase alphanumeric");

export const teamNameSchema = z
  .string()
  .trim()
  .min(3, "Team name must be at least 3 characters")
  .max(32, "Team name must be at most 32 characters");

export const createTeamSchema = z.object({
  name: teamNameSchema,
  tag: teamTagSchema,
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
