const { Command } = require("discord.js-commando");
const DiscordUtil = require('../../common/discordutil.js');

module.exports = class AddRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addrole",
      aliases: ["addr"],
      group: "roles",
      memberName: "add-role",
      description: "Adds a new role to a list of users. Attach a csv or txt file with a list of all the usernames, one per line, that you would like to add the role to.\n Usage:addrole [roleID]",
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
      args: [
        {
          key: "roleID",
          prompt: "What role would you like to temporarily add to user?",
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

    DiscordUtil.openFileAndDo(attachmentURL, function(member){ member.roles.add([roleID]); }, message);
  }
};
