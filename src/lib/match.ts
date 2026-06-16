/** Snake draft pick order for two captains (8 picks → A,B,B,A,A,B,B,A). */
export type DraftSide = "ALPHA" | "BRAVO";

export function snakeDraftOrder(pickCount: number): DraftSide[] {
  if (pickCount <= 0) return [];

  const order: DraftSide[] = [];
  let round = 0;

  while (order.length < pickCount) {
    const alphaFirst = round % 2 === 0;
    if (alphaFirst) {
      order.push("ALPHA");
      if (order.length < pickCount) order.push("BRAVO");
    } else {
      order.push("BRAVO");
      if (order.length < pickCount) order.push("ALPHA");
    }
    round += 1;
  }

  return order;
}

export const PUG_QUEUE_SIZE = 10;
export const PUG_TEAM_SIZE = 5;

export function queueSnapshot(waitingCount: number) {
  return {
    count: waitingCount,
    needed: Math.max(0, PUG_QUEUE_SIZE - waitingCount),
    ready: waitingCount >= PUG_QUEUE_SIZE,
  };
}

export function canConfirmMatch(
  submitterId: string,
  confirmerId: string,
  status: string,
): boolean {
  return status === "SUBMITTED" && submitterId !== confirmerId;
}
