export class BotApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "BotApiError";
  }
}

export type BotApiConfig = {
  baseUrl: string;
  botToken: string;
};

function headers(discordUserId: string, botToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${botToken}`,
    "Content-Type": "application/json",
    "X-Discord-User-Id": discordUserId,
  };
}

async function parseError(res: Response): Promise<BotApiError> {
  try {
    const body = (await res.json()) as { error?: string; code?: string };
    return new BotApiError(res.status, body.error ?? res.statusText, body.code);
  } catch {
    return new BotApiError(res.status, res.statusText);
  }
}

export async function botFetchJson<T>(
  config: BotApiConfig,
  discordUserId: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      ...headers(discordUserId, config.botToken),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as T;
}

export type QueueState = {
  count: number;
  needed: number;
  players: { id: string; name: string; initials: string }[];
};

export type JoinQueueResult = QueueState & {
  ready: boolean;
  matchesCreated: { matchId: string; matchNumber: number }[];
};

export type ActiveMatch = {
  id: string;
  number: number;
  status: string;
  alphaScore: number | null;
  bravoScore: number | null;
  captainAlpha: string | null;
  captainBravo: string | null;
};

export function createBotApiClient(config: BotApiConfig) {
  return {
    getQueue(discordUserId: string) {
      return botFetchJson<QueueState>(config, discordUserId, "/api/bot/queue");
    },
    joinQueue(discordUserId: string) {
      return botFetchJson<JoinQueueResult>(config, discordUserId, "/api/bot/queue", {
        method: "POST",
      });
    },
    leaveQueue(discordUserId: string) {
      return botFetchJson<{ count: number }>(config, discordUserId, "/api/bot/queue", {
        method: "DELETE",
      });
    },
    getActiveMatch(discordUserId: string) {
      return botFetchJson<{ match: ActiveMatch | null }>(
        config,
        discordUserId,
        "/api/bot/matches/active",
      );
    },
    submitResult(
      discordUserId: string,
      matchId: string,
      alphaScore: number,
      bravoScore: number,
    ) {
      return botFetchJson<{ match: ActiveMatch }>(
        config,
        discordUserId,
        `/api/bot/matches/${matchId}/result`,
        {
          method: "POST",
          body: JSON.stringify({ alphaScore, bravoScore }),
        },
      );
    },
    confirmResult(discordUserId: string, matchId: string) {
      return botFetchJson<{ match: ActiveMatch; alreadyConfirmed: boolean }>(
        config,
        discordUserId,
        `/api/bot/matches/${matchId}/confirm`,
        { method: "POST" },
      );
    },
    disputeResult(discordUserId: string, matchId: string, reason?: string) {
      return botFetchJson<{ match: ActiveMatch }>(
        config,
        discordUserId,
        `/api/bot/matches/${matchId}/dispute`,
        {
          method: "POST",
          body: JSON.stringify(reason ? { reason } : {}),
        },
      );
    },
  };
}

export type BotApiClient = ReturnType<typeof createBotApiClient>;
