const { Command } = require("discord.js-commando");
const DiscordUtil = require('../../common/discordutil.js');

module.exports = class RemoveRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "removerole",
      aliases: ["remover"],
      group: "roles",
      memberName: "remove-role",
      description: "Removes a role to a list of users. Attach a csv or txt file with a list of all the usernames, one per line that you would like to remove the role to.\n Usage:removerole [roleID] \n*Example*:\n Bang PD Nim#5414\n Manager Sejin#9829 ",
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
      args: [
        {
          key: "roleID",
          prompt: "What role would you like to remove from users?",
          type: "string",
        },
        { key: "fileURL",
          prompt: "Add a file link if you haven't attached a file in the first message", 
          type: "string"
        }
      ],
    });
  }

  run(message, { roleID, fileURL }) {    
    const attachment = message.attachments.values().next().value;
    var attachmentURL;
    if (!attachment && fileURL.length > 1) {
      attachmentURL = fileURL;       
    }
    if (attachment){
      attachmentURL = attachment.url;
    }
    else {
      return message.reply("No valid file")
    }

    DiscordUtil.openFileAndDo(attachmentURL, function(member){ member.roles.remove([roleID]); }, message);
  }
};
