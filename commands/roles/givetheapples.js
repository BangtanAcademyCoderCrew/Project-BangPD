const { Command } = require("discord.js-commando");
const Discord = require('discord.js');

module.exports = class AddRolesToUsersInMessageCommand extends Command {
  constructor(client) {
    super(client, {
      name: "givetheapples",
      aliases: ["giveapples"],
      group: "roles",
      memberName: "givetheapples",
      description: "Assigns a role to users mentioned in a message. If they have the first role, the second role is assigned.\n Usage:givetheapples [messageID] [channelID] [first role ID] [second role ID]",
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
            key: "firstRoleID",
            prompt: "What role would you like to add to user?",
            type: "string",
        },
        {
          key: "secondRoleID",
          prompt: "What role would you like to add to user if they have the first role?",
          type: "string",
        }
      ],
    });
  }

  run(message, { messageIDs, channel, firstRoleID, secondRoleID }) {

    var allMessageIDs = messageIDs.split(" "); 
    allMessageIDs.forEach(message =>assignRoles(message, firstRoleID, secondRoleID))

    function assignRoles(messageID, firstRoleID, secondRoleID){
      channel.messages.fetch(messageID).then( msg => {
          var content = msg.content.replace(/\D/g, " ");
          content = content.split(" ");
          var members = message.guild.members.cache;
          var bothRoles = [firstRoleID, secondRoleID];
          var ids = content.filter(e => e.length >= 16);
          console.log(ids);
          console.log(ids.length);
          var usersWithFirstRole = []
          var usersWithSecondRole = []
          var userFrequency = {}
          for (var i = 0; i < ids.length; i++){
            userFrequency[ids[i]] = userFrequency[ids[i]] ? userFrequency[ids[i]] + 1 : 1;
          }

          for (var i = 0; i < ids.length; i++){
            var member = members.get(ids[i]);
            console.log(ids[i]);
            if (userFrequency[ids[i]] >= 2){
              if(countInArray(usersWithFirstRole, ids[i]) == 0){
                member.roles.add(bothRoles); 
                usersWithFirstRole.push(member);
                usersWithSecondRole.push(member);
              }
            }
            else if (!member.roles.cache.has(firstRoleID)){
              member.roles.add([firstRoleID]); 
              usersWithFirstRole.push(member)
            }
            else {
              member.roles.add([secondRoleID]);
              usersWithSecondRole.push(member)
            }
          }
          const attachmentFirstRole = new Discord.MessageAttachment(Buffer.from(`${usersWithFirstRole.join("\n")}`, 'utf-8'), 'usersID.txt');
          message.channel.send(`Users in message ${messageID} added role ${firstRoleID}`, attachmentFirstRole);
          const attachment = new Discord.MessageAttachment(Buffer.from(`${usersWithSecondRole.join("\n")}`, 'utf-8'), 'usersID.txt');
          message.channel.send(`Users in message ${messageID} added role ${secondRoleID}`, attachment);
      }).catch(function(error) {
          console.log(error);
          message.channel.send(`Message with ID ${messageID} wasn't found in channel <#${channel.id}>`)
        });
      function countInArray(array, element) {
          return array.filter(item => item == element).length;
      }
    }
  }
};