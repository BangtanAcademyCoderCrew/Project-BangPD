const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrolestouserinmessage')
    .setDescription('Gets a list of user ids that were mentioned in a message.')
    .addStringOption(option => option.setName('message_ids')
      .setDescription('What messages would you like to get the user ids from?')
      .setRequired(true))
    .addChannelOption(option => option.setName('channel')
      .setDescription('In what channel is this message?')
      .setRequired(true))
    .addRoleOption(option => option.setName('role_id')
      .setDescription('What role would you like to add to user?')
      .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const messageIds = options.getString('message_ids');
    const channel = options.getChannel('channel');
    const roleIdToAssign = options.getRole('role_id');

    const checkIDs = (messageId, roleId) => {
      channel.messages.fetch(messageId).then(msg => {
        const content = msg.content.replace(/\D/g, " ").split(" ");
        const ids = content.filter(e => e.length >= 16);
        const members = interaction.guild.members.cache.filter(member => ids.includes(member.id));
        let membersWithRole = '';
        members.forEach(member => {
          member.roles.add([roleId]);
          membersWithRole += `<@${member.user.id}>\n`;
        });
        const attachment = new MessageAttachment(Buffer.from(membersWithRole, 'utf-8'), 'usersID.txt');
        interaction.reply({ content: `Users in message ${messageId} added role ${roleId}`, files: [attachment] });
      }).catch((error) => {
        console.error(error);
        interaction.reply(`Message with ID ${messageId} wasn't found in channel <#${channel.id}>`);
      });
    };

    const allMessageIDs = messageIds.split(' ');
    return allMessageIDs.forEach(message => checkIDs(message, roleIdToAssign));
  }
}
