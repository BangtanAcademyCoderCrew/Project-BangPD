const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageButton,
  MessageActionRow,
  MessageAttachment,
} = require("discord.js");
const DiscordUtil = require("../../common/discordutil.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kickroleinservers")
    .setDescription(
      "Gets all users with the specified role and kicks them from specified servers."
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role you would like to kick people having it")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("server_id_with_role")
        .setDescription("The ID of server where the specified role exists")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("server_ids_to_kick_from")
        .setDescription("The server ids people should get kicked from")
        .setRequired(true)
    )
    .setDefaultPermission(false),
  async execute(interaction) {
    const interactionId = interaction.id;
    const { options } = interaction;
    const role = options.getRole("role");
    const serverWithRole =
      options.getString("server_id_with_role").length >= 16
        ? options.getString("server_id_with_role")
        : null;
    const servers = options
      .getString("server_ids_to_kick_from")
      .split(" ")
      .filter((e) => e.length >= 16);

    await interaction.deferReply({ ephemeral: true });

    const guilds = DiscordUtil.getAllGuilds(servers, interaction);
    const guildWithRole = DiscordUtil.getAllGuilds(
      [serverWithRole],
      interaction
    )[0];
    if (!guildWithRole || guilds === []) {
      return interaction.followUp({
        content:
          "Couldn't get servers with specified IDs <a:shookysad:949689086665437184>",
        ephemeral: true,
      });
    }

    const confirmButton = new MessageButton()
      .setCustomId(`confirmKick_${interactionId}`)
      .setLabel("Kick")
      .setStyle("DANGER");
    const cancelButton = new MessageButton()
      .setCustomId(`cancelKick_${interactionId}`)
      .setLabel("Cancel")
      .setStyle("SECONDARY");
    const actionRow = new MessageActionRow().addComponents(
      cancelButton,
      confirmButton
    );

    const [userIds, mentions] = DiscordUtil.getUsersWithRoleFromServer(
      role,
      guildWithRole
    );
    const guildNames = guilds.map((guild) => guild.name);
    if (userIds.length > 0) {
      await interaction.followUp({
        content: `Are you sure you want to kick these users from ${guildNames} servers?`,
        components: [actionRow],
        ephemeral: true,
      });
      DiscordUtil.splitMessages(mentions).forEach((msg) =>
        interaction.followUp({ content: msg, ephemeral: true })
      );

      const filter = (buttonInteraction) =>
        interaction.user.id === buttonInteraction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
      });
      collector.on("collect", async (click) => {
        if (click.customId === `confirmKick_${interactionId}`) {
          collector.stop();
          await interaction.editReply({
            content: "Kick confirmed",
            components: [],
            ephemeral: true,
          });

          const [membersKicked, errorUsersPerServer] =
            await DiscordUtil.kickUsersOnServers(userIds, guilds);
          const attachment = new MessageAttachment(
            Buffer.from(membersKicked, "utf-8"),
            "usersID.txt"
          );
          await interaction.followUp({
            content: `These ${role} users were kicked from at least one server`,
            files: [attachment],
            ephemeral: true,
          });

          Object.entries(errorUsersPerServer).forEach(([key, value]) => {
            if (value !== "") {
              const errorAttachment = new MessageAttachment(
                Buffer.from(value, "utf-8"),
                "usersID.txt"
              );
              return interaction.followUp({
                content: `There was an error kicking these users from server with ID ${key} <a:shookysad:949689086665437184>`,
                files: [errorAttachment],
                ephemeral: true,
              });
            }
          });
        } else if (click.customId === `cancelKick_${interactionId}`) {
          collector.stop();
          return interaction.editReply({
            content: "Kick canceled",
            components: [],
            ephemeral: true,
          });
        }
      });
    } else {
      return interaction.followUp({
        content: `There are no users with ${role} tag`,
        ephemeral: true,
      });
    }
  },
};
