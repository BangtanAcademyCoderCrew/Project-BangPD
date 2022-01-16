const { Command } = require("discord.js-commando");
const Discord = require('discord.js');

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
    baseRoleID = baseRoleID.replace(/\D/g, "");
    assignedRoleID = assignedRoleID.replace(/\D/g, "");
    const members = message.guild.members.cache.filter(member => member.roles.cache.has(baseRoleID));

    try {
      members.forEach(member => {
        member.roles.remove([assignedRoleID])
      });
    } catch (error) {
      console.error(error)
    }

    // members is a collection, needs to be converted to Array
    // usersWithRoles = [[id, <@id>]], we want to return the id with tags (<@id>)
    const usersWithRolesRemoved = Array.from(members, item => item[1]).join('\n');
    const attachment = new Discord.MessageAttachment(Buffer.from(usersWithRolesRemoved, 'utf-8'), 'usersID.txt');
    message.channel.send(`Users with role ${baseRoleID} removed role ${assignedRoleID}`, attachment);
  }
};
