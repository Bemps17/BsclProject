export type MockDiscordAccount = {
  username: string;
  discriminator: string;
  hue: number;
};

export const MOCK_DISCORD_ACCOUNTS: MockDiscordAccount[] = [
  { username: "xGhost_BR", discriminator: "1337", hue: 235 },
  { username: "NeoStrike", discriminator: "2048", hue: 88 },
  { username: "ShadowFK", discriminator: "0099", hue: 340 },
  { username: "VortexEU", discriminator: "7777", hue: 12 },
];

export function discordTag(account: Pick<MockDiscordAccount, "username" | "discriminator">): string {
  return `${account.username}#${account.discriminator}`;
}
