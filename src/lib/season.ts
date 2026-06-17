/** Pure helper — pass server `referenceTime` from the caller (e.g. RSC page). */
export function computeSeasonDaysLeft(
  endsAt: Date,
  referenceTime: Date,
): number {
  return Math.max(0, Math.ceil((endsAt.getTime() - referenceTime.getTime()) / 86_400_000));
}
