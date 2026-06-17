import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { createClientFromEnv, formatApiError, PUG_QUEUE_SIZE } from "./lib/config.js";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error("Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID");
  process.exit(1);
}

const api = createClientFromEnv();

const commands = [
  new SlashCommandBuilder().setName("join").setDescription("Join the 5v5 PUG queue"),
  new SlashCommandBuilder().setName("leave").setDescription("Leave the PUG queue"),
  new SlashCommandBuilder().setName("queue").setDescription("Show current queue status"),
  new SlashCommandBuilder()
    .setName("result")
    .setDescription("Submit match result (uses active match if no ID)")
    .addIntegerOption((o) =>
      o.setName("alpha").setDescription("Alpha score").setRequired(true).setMinValue(0).setMaxValue(16),
    )
    .addIntegerOption((o) =>
      o.setName("bravo").setDescription("Bravo score").setRequired(true).setMinValue(0).setMaxValue(16),
    )
    .addStringOption((o) => o.setName("match_id").setDescription("Match ID (optional)")),
  new SlashCommandBuilder()
    .setName("confirm")
    .setDescription("Confirm a submitted match result")
    .addStringOption((o) => o.setName("match_id").setDescription("Match ID (optional)")),
  new SlashCommandBuilder()
    .setName("dispute")
    .setDescription("Dispute a match result")
    .addStringOption((o) => o.setName("match_id").setDescription("Match ID (optional)"))
    .addStringOption((o) => o.setName("reason").setDescription("Reason")),
  new SlashCommandBuilder().setName("profile").setDescription("View your BSCL profile"),
  new SlashCommandBuilder().setName("team").setDescription("View your team"),
  new SlashCommandBuilder()
    .setName("support")
    .setDescription("Open a support ticket")
    .addStringOption((o) => o.setName("subject").setDescription("Subject").setRequired(true)),
  new SlashCommandBuilder().setName("admin").setDescription("Staff admin commands"),
].map((c) => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(token!);
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId!, guildId), { body: commands });
    console.log("Registered guild commands");
  } else {
    await rest.put(Routes.applicationCommands(clientId!), { body: commands });
    console.log("Registered global commands");
  }
}

async function resolveMatchId(interaction: ChatInputCommandInteraction): Promise<string | null> {
  const explicit = interaction.options.getString("match_id");
  if (explicit) return explicit;

  const active = await api.getActiveMatch(interaction.user.id);
  return active.match?.id ?? null;
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const { commandName } = interaction;
  const discordId = interaction.user.id;

  switch (commandName) {
    case "join": {
      const result = await api.joinQueue(discordId);
      const created =
        result.matchesCreated.length > 0
          ? `\n🎮 Match #${result.matchesCreated[0]!.matchNumber} created — check https://bscl.gg/play`
          : "";
      await interaction.reply({
        content: `✅ Joined queue (${result.count}/${PUG_QUEUE_SIZE}). ${result.needed} more needed.${created}`,
        ephemeral: true,
      });
      break;
    }
    case "leave": {
      const result = await api.leaveQueue(discordId);
      await interaction.reply({
        content: `Left the queue. **${result.count}** players waiting.`,
        ephemeral: true,
      });
      break;
    }
    case "queue": {
      const snap = await api.getQueue(discordId);
      const ready = snap.count >= PUG_QUEUE_SIZE ? " — Matchmaking!" : "";
      await interaction.reply({
        content: `Queue: **${snap.count}/${PUG_QUEUE_SIZE}** players${ready}`,
      });
      break;
    }
    case "result": {
      const matchId = await resolveMatchId(interaction);
      if (!matchId) {
        await interaction.reply({
          content: "No active match found. Pass `match_id` or join a live match on https://bscl.gg/play",
          ephemeral: true,
        });
        return;
      }
      const alpha = interaction.options.getInteger("alpha", true);
      const bravo = interaction.options.getInteger("bravo", true);
      const { match } = await api.submitResult(discordId, matchId, alpha, bravo);
      await interaction.reply({
        content: `Result submitted for #${String(match.number).padStart(3, "0")}: **${alpha} — ${bravo}**. Awaiting opposing captain /confirm.`,
        ephemeral: true,
      });
      break;
    }
    case "confirm": {
      const matchId = await resolveMatchId(interaction);
      if (!matchId) {
        await interaction.reply({ content: "No match to confirm.", ephemeral: true });
        return;
      }
      const { match, alreadyConfirmed } = await api.confirmResult(discordId, matchId);
      await interaction.reply({
        content: alreadyConfirmed
          ? `Match #${String(match.number).padStart(3, "0")} was already confirmed.`
          : `Match #${String(match.number).padStart(3, "0")} confirmed. ELO updated.`,
        ephemeral: true,
      });
      break;
    }
    case "dispute": {
      const matchId = await resolveMatchId(interaction);
      if (!matchId) {
        await interaction.reply({ content: "No match to dispute.", ephemeral: true });
        return;
      }
      const reason = interaction.options.getString("reason") ?? undefined;
      const { match } = await api.disputeResult(discordId, matchId, reason);
      await interaction.reply({
        content: `Match #${String(match.number).padStart(3, "0")} disputed. Moderators notified.`,
        ephemeral: true,
      });
      break;
    }
    case "profile":
      await interaction.reply({
        content: "View your live stats at https://bscl.gg/profile",
        ephemeral: true,
      });
      break;
    case "team":
      await interaction.reply({
        content: "Manage your team at https://bscl.gg/teams",
        ephemeral: true,
      });
      break;
    case "support":
      await interaction.reply({
        content: `Open a ticket at https://bscl.gg/tickets — subject: **${interaction.options.getString("subject")}**`,
        ephemeral: true,
      });
      break;
    case "admin":
      await interaction.reply({ content: "Admin panel: https://bscl.gg/admin", ephemeral: true });
      break;
    default:
      await interaction.reply({ content: "Unknown command", ephemeral: true });
  }
}

async function main() {
  await registerCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once("ready", () => {
    console.log(`BSCL Matchmaker online as ${client.user?.tag}`);
    console.log(`API: ${process.env.BSCL_API_URL ?? process.env.AUTH_URL ?? "http://localhost:3000"}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      await handleCommand(interaction);
    } catch (err) {
      console.error(err);
      const message = formatApiError(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: message, ephemeral: true });
      } else {
        await interaction.reply({ content: message, ephemeral: true });
      }
    }
  });

  await client.login(token);
}

main().catch(console.error);
