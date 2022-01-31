const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role_in')
    .setDescription('Adds assigned role to all the users with base role.')
    .addRoleOption(option => option.setName('base_role_id')
      .setDescription('What role should the users have (base role)?')
      .setRequired(true))
    .addRoleOption(option => option.setName('assigned_role_id')
      .setDescription('What role would you like to add to users (assigned role)?')
      .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const baseRoleID = options.getRole('base_role_id');
    const assignedRoleID = options.getRole('assigned_role_id');
    const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(baseRoleID));

    try {
      members.forEach(member => {
        member.roles.add([assignedRoleID])
      });
    } catch (error) {
      console.error(error)
    }

    // members is a collection, needs to be converted to Array
    // usersWithRoles = [[id, <@id>]], we want to return the id with tags (<@id>)
    const usersWithRoles = Array.from(members, item => item[1]).join('\n');
    const attachment = MessageAttachment(Buffer.from(usersWithRoles, 'utf-8'), 'usersID.txt');
    interaction.channel.send(`Users with role ${baseRoleID} added role ${assignedRoleID}`, attachment);
  }
}
