import { MessageAttachment } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role_rin')
    .setDescription('Removes assigned role to all the users with base role.')
    .addRoleOption(option => option.setName('baseRoleId')
      .setDescription('What role should the users have (base role)?')
      .setRequired(true))
    .addRoleOption(option => option.setName('assignedRoleID')
      .setDescription('What role would you like to remove from users (assigned role)?')
      .setRequired(true)),
  async execute(interaction) {
    const baseRoleID = baseRoleID.replace(/\D/g, "");
    const assignedRoleID = assignedRoleID.replace(/\D/g, "");
    const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(baseRoleID));
    // This will run each "add role" in parallel and wait for all of them to complete before creating the attachment
    try {
      await Promise.all(members.map(member => {
        member.roles.remove([assignedRoleID])
      }));
    } catch (error) {
      console.error(error)
    }
    const attachment = new MessageAttachment(Buffer.from(`${members.join("\n")}`, 'utf-8'), 'usersID.txt');
    message.channel.send(`Users with role ${baseRoleID} removed role ${assignedRoleID}`, attachment);
  }
}


module.exports = class RemoveRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "role_rin",
      aliases: ["rrin"],
      group: "roles",
      memberName: "role_rin",
      description: "Removes assigned role to all the users with base role role.\n Usage:role_rin base_role assigned_role",
      userPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: "baseRoleID",
          prompt: "What role should the users have (base role)?",
          type: "string",
        },
        {
          key: "assignedRoleID",
          prompt: "What role would you like to remove from users (assigned role)?",
          type: "string",
        }
      ],
    });
  }

  async run(message, { baseRoleID, assignedRoleID }) {
    var members = message.guild.members.cache;
    baseRoleID = baseRoleID.replace(/\D/g, "");
    assignedRoleID = assignedRoleID.replace(/\D/g, "");
    console.log(baseRoleID);
    var usersWithRole = []
    members.forEach(member => {
      if (member.roles.cache.has(baseRoleID)) {
        member.roles.remove([assignedRoleID]);
        usersWithRole.push(member);
      }
    })
    const attachment = new Discord.MessageAttachment(Buffer.from(`${usersWithRole.join("\n")}`, 'utf-8'), 'usersID.txt');
    message.channel.send(`Users with role ${baseRoleID} removed role ${assignedRoleID}`, attachment);
  }
};
