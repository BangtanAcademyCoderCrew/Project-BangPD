const Discord = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('getMessageUserIds')
    .setType(3),
  async execute(interaction) {
    console.log('Debug -- interaction', interaction);
    const messageId = interaction.targetId;
    const channelId = interaction.channelId;
    const guildId = interaction.guildId;

    await interaction.deferReply();

    const guild = interaction.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    channel.messages.fetch(messageId).then((msg) => {
      const ids = msg.mentions.users.map(user => user.id);
      if (ids.length > 0) {
        const attachment = new Discord.MessageAttachment(Buffer.from(`<@${ids.join('>\n<@')}>`, 'utf-8'), 'usersID.txt');
        return interaction.followUp({ content: `Users in message ${messageId}`, files: [attachment] });
      } else {
        return interaction.followUp({ content: 'This message has no users mentioned}' });
      }
    }).catch((error) => {
      console.log(error);
    });
  }
};
