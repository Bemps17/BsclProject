import { handlers } from "@/auth";
import { isBackendEnabled } from "@/lib/backend";

function demoAuthResponse() {
  return Response.json({ error: "Demo mode — auth disabled" }, { status: 503 });
}

export const GET = isBackendEnabled() ? handlers.GET : demoAuthResponse;
export const POST = isBackendEnabled() ? handlers.POST : demoAuthResponse;
