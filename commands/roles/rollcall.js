const { Command } = require("discord.js-commando");
const DiscordUtil = require('../../common/discordutil.js');

module.exports = class RemoveRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rollcall",
      group: "roles",
      memberName: "rollcall",
      description: "Starts rollcall. You will need the role ids that won't be rollcalled and the rollcall role id.",
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
      args: [
        {
          key: "roleExceptionIDs",
          prompt: "What roles are needed to not be rollcalled (ex. Active Student, level 4, etc)?",
          type: "string",
        },
        { key: "rollcallRoleID",
          prompt: "Rollcall Role ID", 
          type: "string"
        }
      ],
    });
  }

  run(message, { roleExceptionIDs, rollcallRoleID }) {    
    
    roleExceptionIDs = roleExceptionIDs.split(' ');

    var members = message.guild.members.cache;
    var rollcalled = 0;
    var activeMembers = 0;

    for (const [member, memberInfo] of members.entries()) {
        if(memberInfo.user.bot){
            continue;
        }
        var isActive = false;

        for (var i = 0; i < roleExceptionIDs.length; i++){
          if(memberInfo.roles.cache.get(roleExceptionIDs[i])){
            isActive = true;
            activeMembers++;
            break;
          }
        }
        if (!isActive){
          memberInfo.roles.add([rollcallRoleID]);
          rollcalled++;
        }
    }
    return message.channel.send(`Rollcall done. ${rollcalled} are in roll call. ${activeMembers} active members.`);
  }
};
