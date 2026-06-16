import { signIn } from "@/auth";
import { LogoHex } from "@/components/bscl/ui";

export function LoginDiscord() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#0B0B0B] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#1E2D45] bg-[#111827] p-8 text-center">
        <div className="mb-4 flex justify-center">
          <LogoHex />
        </div>
        <h1 className="font-[family-name:var(--font-rajdhani)] text-2xl font-bold">
          <span className="text-[#0066FF]">BSCL</span>.gg
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Sign in with Discord to join the competitive league.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-[#5865F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4752C4]"
          >
            Continue with Discord
          </button>
        </form>
      </div>
    </div>
  );
}
