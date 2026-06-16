import { z } from "zod";

export const MATCH_SCORE_MAX = 16;

export const matchScoreSchema = z
  .object({
    alphaScore: z.number().int().min(0).max(MATCH_SCORE_MAX),
    bravoScore: z.number().int().min(0).max(MATCH_SCORE_MAX),
  })
  .refine((scores) => scores.alphaScore !== scores.bravoScore, {
    message: "Match scores cannot tie",
    path: ["bravoScore"],
  });

export type MatchScoreInput = z.infer<typeof matchScoreSchema>;

export const matchIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid match id format");
