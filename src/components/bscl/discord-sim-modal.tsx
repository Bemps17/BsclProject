"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/bscl/locale-provider";
import { DiscordIcon } from "@/components/bscl/icons";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
} from "@/components/bscl/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customUsername, setCustomUsername] = useState("");

  const selected = MOCK_DISCORD_ACCOUNTS[selectedIndex];
  const customTrimmed = customUsername.trim();
  const activeAccount: MockDiscordAccount = customTrimmed
    ? {
        username: customTrimmed,
        discriminator: "0001",
        hue: (customTrimmed.length * 47) % 360,
      }
    : selected;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] gap-0 overflow-hidden border-[#1E2D45] bg-[#313338] p-0 text-[#F2F3F5] ring-[#1E1F22]"
      >
        <div className="flex items-center gap-2 border-b border-[#1E1F22] bg-[#2B2D31] px-4 py-3">
          <DiscordIcon className="h-7 w-7 text-[#5865F2]" />
          <DialogTitle className="text-sm font-semibold text-[#F2F3F5]">
            {t.login.discordSim.title}
          </DialogTitle>
        </div>

        <div className="px-5 py-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary font-[family-name:var(--font-rajdhani)] text-sm font-bold text-primary-foreground">
              BS
            </div>
            <div className="min-w-0 pt-0.5">
              <DialogDescription className="text-[15px] font-semibold leading-snug text-[#F2F3F5]">
                {t.login.discordSim.subtitle}
              </DialogDescription>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#B5BAC1]">
                {t.login.discordSim.permissionsTitle}
              </p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[#DBDEE1]">
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
                <Button
                  key={discordTag(account)}
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setSelectedIndex(index);
                    setCustomUsername("");
                  }}
                  className={cn(
                    "border-[#3F4147] text-[11px] text-[#B5BAC1] hover:border-[#5865F2]/50",
                    !customTrimmed && selectedIndex === index &&
                      "border-[#5865F2] bg-[#5865F2]/20 text-[#F2F3F5]",
                  )}
                >
                  {discordTag(account)}
                </Button>
              ))}
            </div>

            <Field className="mt-3">
              <FieldLabel className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#B5BAC1]">
                {t.login.discordSim.customUsername}
              </FieldLabel>
              <Input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                maxLength={24}
                placeholder="MyUsername"
                className="border-[#3F4147] bg-[#1E1F22] text-[#F2F3F5] focus-visible:border-[#5865F2]"
              />
            </Field>
          </div>

          <p className="mt-3 text-center text-[11px] text-[#949BA4]">{t.login.discordSim.demoNote}</p>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-[#1E1F22] bg-[#2B2D31] p-4 sm:justify-stretch">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-[#DBDEE1] hover:bg-transparent hover:underline"
          >
            {t.login.discordSim.cancel}
          </Button>
          <Button
            type="button"
            onClick={() => onAuthorize(activeAccount)}
            disabled={!activeAccount.username.trim()}
            className="flex-1 bg-[#5865F2] text-white hover:bg-[#4752C4]"
          >
            {t.login.discordSim.authorize}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
