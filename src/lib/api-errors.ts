import { NextResponse } from "next/server";
import { BotAuthError } from "@/lib/bot-auth";
import { MatchLifecycleError } from "@/lib/match-lifecycle";

export function matchLifecycleErrorResponse(error: unknown) {
  if (error instanceof MatchLifecycleError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "FORBIDDEN"
          ? 403
          : error.code === "CONFLICT"
            ? 409
            : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (error instanceof Error && error.message === "BANNED") {
    return NextResponse.json({ error: "Account banned" }, { status: 403 });
  }
  return NextResponse.json({ error: "Request failed" }, { status: 500 });
}

export function botAuthErrorResponse(error: unknown) {
  if (error instanceof BotAuthError) {
    const status =
      error.code === "BOT_UNAUTHORIZED"
        ? 401
        : error.code === "DISCORD_ID_REQUIRED" || error.code === "ACCOUNT_NOT_LINKED"
          ? 400
          : 403;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }
  return matchLifecycleErrorResponse(error);
}
