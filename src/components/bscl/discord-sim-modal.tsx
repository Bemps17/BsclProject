"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useT } from "@/components/bscl/locale-provider";
import {
  MOCK_DISCORD_ACCOUNTS,
  discordTag,
  type MockDiscordAccount,
} from "@/lib/discord-sim";
import { playerInitials } from "@/lib/ranks";

function DiscordAvatar({
  account,
  size = "md",
}: {
  account: Pick<MockDiscordAccount, "username" | "hue">;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dim,
      )}
      style={{ backgroundColor: `hsl(${account.hue} 65% 45%)` }}
      aria-hidden
    >
      {playerInitials(account.username)}
    </div>
  );
}

export function DiscordSimModal({
  open,
  onClose,
  onAuthorize,
}: {
  open: boolean;
  onClose: () => void;
  onAuthorize: (account: MockDiscordAccount) => void;
}) {
  const t = useT();
  const titleId = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customUsername, setCustomUsername] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const selected = MOCK_DISCORD_ACCOUNTS[selectedIndex];
  const customTrimmed = customUsername.trim();
  const activeAccount: MockDiscordAccount = customTrimmed
    ? {
        username: customTrimmed,
        discriminator: "0001",
        hue: (customTrimmed.length * 47) % 360,
      }
    : selected;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[420px] overflow-hidden rounded-xl border border-[#1E2D45] bg-[#313338] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[#1E1F22] bg-[#2B2D31] px-4 py-3">
          <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#5865F2"
              d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
            />
          </svg>
          <span id={titleId} className="text-sm font-semibold text-[#F2F3F5]">
            {t.login.discordSim.title}
          </span>
        </div>

        <div className="px-5 py-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0066FF] font-[family-name:var(--font-rajdhani)] text-sm font-bold text-white">
              BS
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[15px] font-semibold leading-snug text-[#F2F3F5]">
                {t.login.discordSim.subtitle}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#B5BAC1]">
                {t.login.discordSim.permissionsTitle}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-[#DBDEE1]">
                {t.login.discordSim.permissions.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#5865F2]">✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-[#1E1F22] bg-[#2B2D31] p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#B5BAC1]">
              {t.login.discordSim.loggedInAs}
            </p>
            <div className="flex items-center gap-2.5">
              <DiscordAvatar account={activeAccount} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#F2F3F5]">
                  {activeAccount.username}
                </p>
                <p className="text-xs text-[#B5BAC1]">#{activeAccount.discriminator}</p>
              </div>
            </div>

            <p className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#B5BAC1]">
              {t.login.discordSim.switchAccount}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MOCK_DISCORD_ACCOUNTS.map((account, index) => (
                <button
                  key={discordTag(account)}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(index);
                    setCustomUsername("");
                  }}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-medium transition",
                    !customTrimmed && selectedIndex === index
                      ? "border-[#5865F2] bg-[#5865F2]/20 text-[#F2F3F5]"
                      : "border-[#3F4147] text-[#B5BAC1] hover:border-[#5865F2]/50",
                  )}
                >
                  {discordTag(account)}
                </button>
              ))}
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#B5BAC1]">
                {t.login.discordSim.customUsername}
              </span>
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                maxLength={24}
                placeholder="MyUsername"
                className="w-full rounded-md border border-[#3F4147] bg-[#1E1F22] px-3 py-2 text-sm text-[#F2F3F5] outline-none focus:border-[#5865F2]"
              />
            </label>
          </div>

          <p className="mt-3 text-center text-[11px] text-[#949BA4]">{t.login.discordSim.demoNote}</p>
        </div>

        <div className="flex gap-2 border-t border-[#1E1F22] bg-[#2B2D31] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-[#DBDEE1] transition hover:underline"
          >
            {t.login.discordSim.cancel}
          </button>
          <button
            type="button"
            onClick={() => onAuthorize(activeAccount)}
            disabled={!activeAccount.username.trim()}
            className="flex-1 rounded-md bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4752C4] disabled:opacity-50"
          >
            {t.login.discordSim.authorize}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
