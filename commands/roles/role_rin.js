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

  async run(message, { baseRoleID, assignedRoleID}) {    
    var members = message.guild.members.cache;
    baseRoleID = baseRoleID.replace(/\D/g, "");
    assignedRoleID = assignedRoleID.replace(/\D/g, "");
    console.log(baseRoleID);
    var usersWithRole = []
    members.forEach(member => {
      if(member.roles.cache.has(baseRoleID)){
        member.roles.remove([assignedRoleID]);
        usersWithRole.push(member);
      }
    })
    const attachment = new Discord.MessageAttachment(Buffer.from(`${usersWithRole.join("\n")}`, 'utf-8'), 'usersID.txt');
    message.channel.send(`Users with role ${baseRoleID} removed role ${assignedRoleID}`, attachment);
  }
};
