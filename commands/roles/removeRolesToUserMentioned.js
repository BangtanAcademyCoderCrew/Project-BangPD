const { Command } = require("discord.js-commando");
const Discord = require('discord.js');

module.exports = class RemoveRolesToUsersInMessageCommand extends Command {
  constructor(client) {
    super(client, {
      name: "removerolestouserinmessage",
      aliases: ["removerolem", "remrolesm"],
      group: "roles",
      memberName: "removerolestouserinmessage",
      description: "Removes a role to users that were mentioned in a message.\n Usage:removerolestouserinmessage [messageID] [channelID]",
      userPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: "messageIDs",
          prompt: "What messages would you like to get the user ids from?",
          type: "string",
        },
        {
            key: "channel",
            prompt: "In what channel is this message?",
            type: "channel",
        },
        {
            key: "roleID",
            prompt: "What role would you like to remove to user?",
            type: "string",
        }
      ],
    });
  }

  run(message, { messageIDs, channel, roleID }) {

    var allMessageIDs = messageIDs.split(" "); 
    allMessageIDs.forEach(message =>checkIDs(message, roleID))

    function checkIDs(messageID, roleID){
      channel.messages.fetch(messageID).then( msg => {
          var content = msg.content.replace(/\D/g, " ");
          content = content.split(" ");
          var members = message.guild.members.cache;
          var ids = content.filter(e => e.length >= 16);
          for (var i = 0; i < ids.length; i++){
            var member = members.get(ids[i]);
            member.roles.remove([roleID]); 
          }
          const attachment = new Discord.MessageAttachment(Buffer.from(`<@${ids.join(">\n<@")}>`, 'utf-8'), 'usersID.txt');
          message.channel.send(`Users in message ${messageID} added role ${roleID}`, attachment);
      }).catch(function(error) {
          console.log(error);
          message.channel.send(`Message with ID ${messageID} wasn't found in channel <#${channel.id}>`)
        });
    }
  }
};