const Discord = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('get reactions')
    .setType(3)
    .setDefaultPermission(false),
  async execute(interaction) {
    const messageId = interaction.targetId;
    const channelId = interaction.channelId;
    const guildId = interaction.guildId;

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    channel.messages.fetch(messageId).then((msg) => {
      const users = {};
      const reactions = msg.reactions.cache;
      if (reactions.size > 0) {
        msg.reactions.cache.map((reaction) => {
          users[reaction.emoji] = [];
          reaction.users.fetch().then(result => {
            result.map(user => {
              users[reaction.emoji].push('<@' + user.id + '>');
            });
            const attachment = new Discord.MessageAttachment(Buffer.from(`${users[reaction.emoji].join('\n')}`, 'utf-8'), 'emoji reactions.txt');
            return interaction.followUp({ content: `Users that reacted with ${reaction.emoji}`, files: [attachment], ephemeral: true });
          });
        });
      } else {
        return interaction.followUp({ content: `There are no reactions to message ${messageId}`, ephemeral: true });
      }
    }).catch((error) => {
      console.log(error);
    });
  }
};
