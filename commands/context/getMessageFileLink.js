const { ContextMenuCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('getMessageFileLink')
    .setType(3),
  async execute(interaction) {
    console.log('Debug -- interaction', interaction);
    const messageId = interaction.targetId;
    const channelId = interaction.channelId;
    const guildId = interaction.guildId;

    await interaction.deferReply();

    const guild = interaction.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    channel.messages.fetch(messageId).then((message) => {
      const attachment = message.attachments.values().next().value;
      if (attachment) {
        return interaction.followUp({ content: `Message with ID ${messageId} has file ${attachment.url}` });
      } else {
        return interaction.followUp({ content: 'This message doesn\'t have a file' });
      }
    }).catch((error) => {
      console.log(error);
    });
  }
};
