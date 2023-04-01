const Discord = require("discord.js");
const { ContextMenuCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("get user ids").setType(3),
  async execute(interaction) {
    const messageId = interaction.targetId;
    const { channelId } = interaction;
    const { guildId } = interaction;

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    channel.messages
      .fetch(messageId)
      .then((msg) => {
        const ids = msg.mentions.users
          .filter((user) => !user.bot)
          .map((user) => user.id);
        if (ids.length > 0) {
          const attachment = new Discord.MessageAttachment(
            Buffer.from(`<@${ids.join(">\n<@")}>`, "utf-8"),
            "userIDs.txt"
          );
          return interaction.followUp({
            content: `Users in message ${messageId}`,
            files: [attachment],
            ephemeral: true,
          });
        }
        return interaction.followUp({
          content: `There are no user mentions in message ${messageId}`,
          ephemeral: true,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
