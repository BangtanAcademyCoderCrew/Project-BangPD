const { MessageAttachment, Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('areactivestudents')
    .setDescription('Gets a list of user ids that were mentioned in a message and see if they are active or not.')
    .addStringOption(option =>
      option.setName('message_ids')
        .setDescription('What messages would you like to get the user ids from?')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('In what channel is this message?')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('What\'s the active student role?')
        .setRequired(true))
    .setDefaultPermission(false),
  async execute(interaction) {
    // Check user permissions
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      return interaction.reply('Insufficient permissions to use this command.')
    }

    const options = interaction.options;
    const messageIds = options.getString('message_ids');
    const roleId = options.getRole('role').id;
    const channel = options.getChannel('channel');

    const hasActiveStudentRole = (ids, roleID) => {
      const activeStudents = Array.from(interaction.guild.roles.cache.get(roleID).members.keys());
      const areActiveStudents = ids.filter(id => activeStudents.includes(id));
      return areActiveStudents;
    }

    const checkIDs = (messageID) => {
      channel.messages.fetch(messageID).then(msg => {
        const content = msg.content.replace(/\D/g, ' ').split(' ');
        const ids = content.filter(e => e.length >= 16);
        const activeStudents = hasActiveStudentRole(ids, roleId);
        const notActiveStudents = ids.filter(id => !activeStudents.includes(id));
        const attachmentActive = new MessageAttachment(Buffer.from(`<@${activeStudents.join(">\n<@")}>`, 'utf-8'), 'activeStudents.txt');
        const attachmentNotActive = new MessageAttachment(Buffer.from(`<@${notActiveStudents.join(">\n<@")}>`, 'utf-8'), 'activeStudents.txt');
        interaction.channel.send({ content: `Users in message ${messageID} who are active`, files: [attachmentActive] });
        interaction.channel.send({ content: `Users in message ${messageID} who are not active`, files: [attachmentNotActive] });
      }).catch((error) => {
        console.error(error);
        interaction.channel.send(`Message with ID ${messageID} wasn't found in channel <#${channel.id}>`)
      });
    }

    const allMessageIDs = messageIds.split(" ");
    allMessageIDs.forEach(message => checkIDs(message))
  }
}
