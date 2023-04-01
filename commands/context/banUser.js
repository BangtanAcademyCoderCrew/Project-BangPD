const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const { MessageButton, MessageActionRow } = require("discord.js");
const DiscordUtil = require("../../common/discordutil.js");

const ALL_GUILD_IDS = DiscordUtil.getAllGuildIds();

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("ban user")
    .setType(2)
    .setDefaultPermission(false),
  async execute(interaction) {
    const user = interaction.targetUser;
    const interactionId = interaction.id;

    const guilds = DiscordUtil.getAllGuilds(ALL_GUILD_IDS, interaction);

    const confirmButton = new MessageButton()
      .setCustomId(`confirmBan_${interactionId}`)
      .setLabel("Ban")
      .setStyle("DANGER");
    const cancelButton = new MessageButton()
      .setCustomId(`cancelBan_${interactionId}`)
      .setLabel("Cancel")
      .setStyle("SECONDARY");
    const actionRow = new MessageActionRow().addComponents(
      cancelButton,
      confirmButton
    );

    await interaction.reply({
      content: `Are you sure you want to ban user ${user} from all BA servers?`,
      components: [actionRow],
      ephemeral: true,
    });

    const filter = (buttonInteraction) =>
      interaction.user.id === buttonInteraction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
    });
    collector.on("collect", async (click) => {
      if (click.customId === `confirmBan_${interactionId}`) {
        collector.stop();
        await interaction.editReply({
          content: "Ban confirmed",
          components: [],
          ephemeral: true,
        });
        const [membersBanned, errorUsersPerServer] =
          await DiscordUtil.banUsersOnServers([user.id], guilds);
        let errorGuilds = "";
        Object.entries(errorUsersPerServer).forEach(([key, value]) => {
          if (value !== "") {
            errorGuilds += `${key},`;
          }
        });
        if (errorGuilds === "") {
          return interaction.followUp({
            content: `User ${user} has been banned`,
            ephemeral: true,
          });
        }
        errorGuilds = errorGuilds.slice(0, -1);
        return interaction.followUp({
          content: `User ${user} could not be banned from servers with IDs ${errorGuilds}`,
          ephemeral: true,
        });
      }
      if (click.customId === `cancelBan_${interactionId}`) {
        collector.stop();
        return interaction.editReply({
          content: "Ban canceled",
          components: [],
          ephemeral: true,
        });
      }
    });
  },
};
