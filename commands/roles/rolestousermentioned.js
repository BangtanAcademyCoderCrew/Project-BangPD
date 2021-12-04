const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrolestouserinmessage')
    .setDescription('Gets a list of user ids that were mentioned in a message.')
    .addStringOption(option =>
      option.setName('messageIds')
        .setDescription('What messages would you like to get the user ids from?')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('In what channel is this message?')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('roleId')
        .setDescription('What role would you like to add to user?')
        .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const messageIds = options.getString('messageIds');
    const channel = options.getChannel('channel');
    const roleIdToAssign = options.getRole('roleId')

    const allMessageIDs = messageIds.split(' ');
    allMessageIDs.forEach(message => checkIDs(message, roleIdToAssign))

    const checkIDs = (messageId, roleId) => {
      channel.messages.fetch(messageId).then(msg => {
        const content = msg.content.replace(/\D/g, " ").split(" ");
        const ids = content.filter(e => e.length >= 16);
        const members = interaction.guild.members.fetch({ user: ids });
        members.forEach(member => member.roles.add([roleId]))
        const attachment = new Discord.MessageAttachment(Buffer.from(`<@${ids.join(">\n<@")}>`, 'utf-8'), 'usersID.txt');
        interaction.channel.send(`Users in message ${messageId} added role ${roleId}`, attachment);
      }).catch((error) => {
        console.error(error);
        interaction.channel.send(`Message with ID ${messageId} wasn't found in channel <#${channel.id}>`)
      });
    }
  }
}
