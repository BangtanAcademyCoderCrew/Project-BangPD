const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getuserids')
    .setDescription('Gets a list of user ids that were mentioned in a message')
    .addStringOption(option =>
      option.setName('message_ids')
        .setDescription('The message ids you would like to get the user ids from')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel this message is in')
        .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
        .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const messageIds = options.getString('message_ids');
    const channel = options.getChannel('channel');

    await interaction.deferReply();

    const checkIDs = (messageId) => {
      channel.messages.fetch(messageId).then((msg) => {
        const ids = msg.mentions.users.filter(user => !user.bot).map(user => user.id);
        const attachment = new Discord.MessageAttachment(Buffer.from(`<@${ids.join('>\n<@')}>`, 'utf-8'), 'userIDs.txt');
        interaction.followUp({ content: `Users in message ${messageId}`, files: [attachment] });
      }).catch((error) => {
        console.log(error);
        interaction.followUp({ content: `Message with ID ${messageId} wasn't found in channel <#${channel.id}> <a:shookysad:949689086665437184>` });
      });
    };
    const allMessageIDs = messageIds.split(' ');
    allMessageIDs.forEach(message => checkIDs(message));
  }
};
