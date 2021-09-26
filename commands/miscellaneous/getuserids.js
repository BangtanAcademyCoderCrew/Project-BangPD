const { Command } = require("discord.js-commando");
const Discord = require('discord.js');

module.exports = class GetUserIdsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "getuserids",
      aliases: ["getids"],
      group: "miscellaneous",
      memberName: "getuserids",
      description: "Gets a list of user ids that were mentioned in a message.\n Usage:getuserids [messageID] [channelID]",
      userPermissions: [],
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
      ],
    });
  }

  run(message, { messageIDs, channel }) {

    var allMessageIDs = messageIDs.split(" "); 
    allMessageIDs.forEach(message =>checkIDs(message))

    function checkIDs(messageID){
      channel.messages.fetch(messageID).then( msg => {
          var content = msg.content.replace(/\D/g, " ");
          content = content.split(" ");
          var ids = content.filter(e => e.length >= 18);
          const attachment = new Discord.MessageAttachment(Buffer.from(`<@${ids.join(">\n<@")}>`, 'utf-8'), 'usersID.txt');
          message.channel.send(`Users in message ${messageID}`, attachment);
      }).catch(function(error) {
          console.log(error);
          message.channel.send(`Message with ID ${messageID} wasn't found in channel <#${channel.id}>`)
        });
    }
  }
};
