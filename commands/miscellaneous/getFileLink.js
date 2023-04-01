const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getfilelink")
    .setDescription("Get file link from a message")
    .addStringOption((option) =>
      option
        .setName("message_id")
        .setDescription("The message id with a file")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel this message is in")
        .addChannelTypes([
          ChannelType.GuildText,
          ChannelType.GuildPublicThread,
          ChannelType.GuildPrivateThread,
        ])
        .setRequired(true)
    ),
  async execute(interaction) {
    const { options } = interaction;
    const messageId = options.getString("message_id");
    const channel = options.getChannel("channel");

    channel.messages
      .fetch(messageId)
      .then((message) => {
        const attachment = message.attachments.values().next().value;
        if (attachment) {
          return interaction.reply({
            content: `Message with ID ${messageId} has file ${attachment.url}`,
          });
        }
        return interaction.reply({
          content: `Message with ID ${messageId} doesn't have a file`,
        });
      })
      .catch((error) => {
        console.log(error);
        interaction.reply({
          content: `Message with ID ${messageId} wasn't found in channel <#${channel.id}> <a:shookysad:949689086665437184>`,
        });
      });
  },
};
