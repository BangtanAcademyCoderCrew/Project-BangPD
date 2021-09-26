const { Command } = require("discord.js-commando");
const DiscordUtil = require('../../common/discordutil.js');

module.exports = class RemoveRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "role_in",
      aliases: ["rin"],
      group: "roles",
      memberName: "role_in",
      description: "Adds assigned role to all the users with base role role.\n Usage:role_in base_role assigned_role",
      userPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: "baseRoleID",
          prompt: "What role should the users have (base role)?",
          type: "string",
        },
        {
          key: "assignedRoleID",
          prompt: "What role would you like to add to users (assigned role)?",
          type: "string",
        }
      ],
    });
  }

  async run(message, { baseRoleID, assignedRoleID}) {    
    var members = message.guild.members.cache;
    baseRoleID = baseRoleID.replace(/\D/g, "");
    assignedRoleID = assignedRoleID.replace(/\D/g, "");
    var usersWithRole = []
    members.forEach(member => {
      if(member.roles.cache.has(baseRoleID)){
        member.roles.add([assignedRoleID]);
        usersWithRole.push(member);
      }
    })
    const attachment = new Discord.MessageAttachment(Buffer.from(`${usersWithRole.join("\n")}`, 'utf-8'), 'usersID.txt');
    message.channel.send(`Users with role ${baseRoleID} added role ${assignedRoleID}`, attachment);
  }
};
