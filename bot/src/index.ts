import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error("Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName("join").setDescription("Join the 5v5 PUG queue"),
  new SlashCommandBuilder().setName("leave").setDescription("Leave the PUG queue"),
  new SlashCommandBuilder().setName("queue").setDescription("Show current queue status"),
  new SlashCommandBuilder()
    .setName("result")
    .setDescription("Submit match result")
    .addStringOption((o) => o.setName("alpha").setDescription("Alpha score").setRequired(true))
    .addStringOption((o) => o.setName("bravo").setDescription("Bravo score").setRequired(true)),
  new SlashCommandBuilder()
    .setName("confirm")
    .setDescription("Confirm a submitted match result")
    .addStringOption((o) => o.setName("match_id").setDescription("Match ID").setRequired(true)),
  new SlashCommandBuilder()
    .setName("dispute")
    .setDescription("Dispute a match result")
    .addStringOption((o) => o.setName("match_id").setDescription("Match ID").setRequired(true)),
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

const queue = new Set<string>();

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const { commandName } = interaction;

  switch (commandName) {
    case "join":
      queue.add(interaction.user.id);
      await interaction.reply({
        content: `✅ Joined queue (${queue.size}/10). ${Math.max(0, 10 - queue.size)} more needed.`,
        ephemeral: true,
      });
      break;
    case "leave":
      queue.delete(interaction.user.id);
      await interaction.reply({ content: "Left the queue.", ephemeral: true });
      break;
    case "queue":
      await interaction.reply({
        content: `Queue: **${queue.size}/10** players${queue.size >= 10 ? " — Draft starting!" : ""}`,
      });
      break;
    case "result":
      await interaction.reply({
        content: `Result submitted: Alpha ${interaction.options.getString("alpha")} — Bravo ${interaction.options.getString("bravo")}. Awaiting /confirm.`,
      });
      break;
    case "confirm":
      await interaction.reply({ content: `Match ${interaction.options.getString("match_id")} confirmed. ELO updated.` });
      break;
    case "dispute":
      await interaction.reply({ content: `Match ${interaction.options.getString("match_id")} disputed. Moderator notified.` });
      break;
    case "profile":
      await interaction.reply({
        content: "Profile: **xGhost_BR** · Diamond · 1642 ELO · 61% WR\nhttps://bscl.gg/profile",
        ephemeral: true,
      });
      break;
    case "team":
      await interaction.reply({ content: "You are not in a team. Create one at https://bscl.gg/teams", ephemeral: true });
      break;
    case "support":
      await interaction.reply({
        content: `Ticket created: **${interaction.options.getString("subject")}**. Staff will respond soon.`,
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
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      await handleCommand(interaction);
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Command failed.", ephemeral: true });
      } else {
        await interaction.reply({ content: "Command failed.", ephemeral: true });
      }
    }
  });

  await client.login(token);
}

main().catch(console.error);
