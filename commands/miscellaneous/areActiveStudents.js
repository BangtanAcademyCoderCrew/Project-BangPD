const { Command } = require("discord.js-commando");
const Discord = require('discord.js');

module.exports = class AreActiveStudentsCommand extends Command {
  constructor(client) {
    super(client, {
      name: "areactivestudents",
      aliases: ["activestudents"],
      group: "miscellaneous",
      memberName: "areactivestudents",
      description: "Gets a list of user ids that were mentioned in a message and see if they are active or not.\n Usage:areactivestudents [messageID] [channelID] [roleID]",
      userPermissions: ['MANAGE_MESSAGES'],
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
          prompt: "What's the active student role?",
          type: "string",
        },
      ],
    });
  }

  run(message, { messageIDs, channel, roleID }) {

    var allMessageIDs = messageIDs.split(" "); 
    roleID = roleID.replace(/\D/g, "");
    allMessageIDs.forEach(message =>checkIDs(message))

    function checkIDs(messageID){
      channel.messages.fetch(messageID).then( msg => {
          var content = msg.content.replace(/\D/g, " ");
          content = content.split(" ");
          var ids = content.filter(e => e.length >= 16);
          var activeStudents = hasActiveStudentRole(ids, roleID);
          var notActiveStudents = ids.filter(id => !activeStudents.includes(id));
          const attachmentActive = new Discord.MessageAttachment(Buffer.from(`<@${activeStudents.join(">\n<@")}>`, 'utf-8'), 'activeStudents.txt');
          const attachmentNotActive = new Discord.MessageAttachment(Buffer.from(`<@${notActiveStudents.join(">\n<@")}>`, 'utf-8'), 'activeStudents.txt');
          message.channel.send(`Users in message ${messageID} who are active`, attachmentActive);
          message.channel.send(`Users in message ${messageID} who are not active`, attachmentNotActive);
      }).catch(function(error) {
          console.log(error);
          message.channel.send(`Message with ID ${messageID} wasn't found in channel <#${channel.id}>`)
        });
    }

    function hasActiveStudentRole(ids, roleID){
      const activeStudents = Array.from(message.guild.roles.cache.get(roleID).members.keys());
      const areActiveStudents = ids.filter(id => activeStudents.includes(id));
      return areActiveStudents;
    }
  }
};
