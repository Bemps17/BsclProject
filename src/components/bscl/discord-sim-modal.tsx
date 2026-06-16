"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useT } from "@/components/bscl/locale-provider";
import { DiscordIcon } from "@/components/bscl/icons";
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
          <DiscordIcon className="h-7 w-7 text-[#5865F2]" />
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
