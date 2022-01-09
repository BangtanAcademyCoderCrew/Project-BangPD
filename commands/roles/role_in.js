import { MessageAttachment } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role_in')
    .setDescription('Adds assigned role to all the users with base role.')
    .addRoleOption(option => option.setName('baseRoleId')
      .setDescription('What role should the users have (base role)?')
      .setRequired(true))
    .addRoleOption(option => option.setName('assignedRoleID')
      .setDescription('What role would you like to add to users (assigned role)?')
      .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const baseRoleID = options.getRole('baseRoleId');
    const assignedRoleID = options.getRole('assignedRoleID');
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
