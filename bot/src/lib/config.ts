import {
  BotApiError,
  createBotApiClient,
  type BotApiClient,
} from "./api-client.js";
import { PUG_QUEUE_SIZE } from "./queue.js";

export function resolveBotApiConfig() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const baseUrl = process.env.BSCL_API_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

  if (!botToken) {
    throw new Error("Missing DISCORD_BOT_TOKEN");
  }

  return { botToken, baseUrl };
}

export function createClientFromEnv(): BotApiClient {
  const { botToken, baseUrl } = resolveBotApiConfig();
  return createBotApiClient({ botToken, baseUrl });
}

export function formatApiError(error: unknown): string {
  if (error instanceof BotApiError) {
    if (error.code === "ACCOUNT_NOT_LINKED") {
      return `${error.message}`;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
}

export { BotApiError, PUG_QUEUE_SIZE };
