const { ContextMenuCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('file url')
    .setType(3),
  async execute(interaction) {
    const messageId = interaction.targetId;
    const channelId = interaction.channelId;
    const guildId = interaction.guildId;

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    channel.messages.fetch(messageId).then((message) => {
      const attachment = message.attachments.values().next().value;
      if (attachment) {
        return interaction.followUp({ content: `Message with ID ${messageId} has file ${attachment.url}`, ephemeral: true });
      } else {
        return interaction.followUp({ content: `There is no file in message ${messageId}`, ephemeral: true });
      }
    }).catch((error) => {
      console.log(error);
    });
  }
};
