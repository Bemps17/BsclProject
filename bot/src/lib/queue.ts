export const PUG_QUEUE_SIZE = 10;

export function queueSnapshot(waitingCount: number) {
  return {
    count: waitingCount,
    needed: Math.max(0, PUG_QUEUE_SIZE - waitingCount),
    ready: waitingCount >= PUG_QUEUE_SIZE,
  };
}
