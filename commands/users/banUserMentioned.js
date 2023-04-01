const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const {
  MessageAttachment,
  MessageButton,
  MessageActionRow,
} = require("discord.js");
const DiscordUtil = require("../../common/discordutil.js");

const ALL_GUILD_IDS = DiscordUtil.getAllGuildIds();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banuserinmessage")
    .setDescription(
      "Gets a list of user ids mentioned in a message(s) and bans them from all servers."
    )
    .addStringOption((option) =>
      option
        .setName("message_ids")
        .setDescription(
          "The message id(s) you would like to get the user ids from"
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel the message(s) are in")
        .addChannelTypes([
          ChannelType.GuildText,
          ChannelType.GuildPublicThread,
          ChannelType.GuildPrivateThread,
        ])
        .setRequired(true)
    )
    .setDefaultPermission(false),
  async execute(interaction) {
    const { options } = interaction;
    const messageIds = options.getString("message_ids");
    const channel = options.getChannel("channel");
    const interactionId = interaction.id;

    await interaction.deferReply({ ephemeral: true });

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
    await interaction.followUp({
      content: "Are you sure you want to ban these users from all BA servers?",
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

        const allMessageIds = messageIds.split(" ");
        for (const messageId of allMessageIds) {
          channel.messages.fetch(messageId).then(async (msg) => {
            const userIds = msg.mentions.users.map((user) => user.id);
            const [membersBanned, errorUsersPerServer] =
              await DiscordUtil.banUsersOnServers(userIds, guilds);
            const attachment = new MessageAttachment(
              Buffer.from(membersBanned, "utf-8"),
              "usersID.txt"
            );
            interaction.followUp({
              content: `These users in message ${messageId} were banned from at least one server`,
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
                  content: `There was an error banning these users in message ${messageId} from server with ID ${key} <a:shookysad:949689086665437184>`,
                  files: [errorAttachment],
                  ephemeral: true,
                });
              }
            });
          });
        }
      } else if (click.customId === `cancelBan_${interactionId}`) {
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
