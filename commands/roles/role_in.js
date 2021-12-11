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
    baseRoleID = baseRoleID.replace(/\D/g, "");
    assignedRoleID = assignedRoleID.replace(/\D/g, "");
    const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(baseRoleID));
    // This will run each "add role" in parallel and wait for all of them to complete before creating the attachment
    await Promise.all(members.map(member => {
      member.roles.add([assignedRoleID])
    }));
    const attachment = new MessageAttachment(Buffer.from(`${members.join("\n")}`, 'utf-8'), 'usersID.txt');
    message.channel.send(`Users with role ${baseRoleID} added role ${assignedRoleID}`, attachment);
  }
}
