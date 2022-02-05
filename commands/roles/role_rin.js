const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role_rin')
    .setDescription('Removes assigned role to all the users with base role.')
    .addRoleOption(option => option.setName('base_role')
      .setDescription('What role should the users have (base role)?')
      .setRequired(true))
    .addRoleOption(option => option.setName('assigned_role')
      .setDescription('What role would you like to remove from users (assigned role)?')
      .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const baseRole = options.getRole('base_role');
    const assignedRole = options.getRole('assigned_role');
    const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(baseRole.id));

    try {
      members.forEach(member => {
        member.roles.remove([assignedRole.id])
      });
    } catch (error) {
      console.error(error)
    }

    // members is a collection, needs to be converted to Array
    // usersWithRoles = [[id, <@id>]], we want to return the id with tags (<@id>)
    const usersWithRolesRemoved = Array.from(members, item => item[1]).join('\n');
    const attachment = new MessageAttachment(Buffer.from(usersWithRolesRemoved, 'utf-8'), 'usersID.txt');
    return interaction.reply({ content: `Users with role ${baseRole} removed role ${assignedRole}`, files: [attachment] });
  }
}
