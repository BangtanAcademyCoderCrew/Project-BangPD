const { Command } = require("discord.js-commando");
const Discord = require('discord.js');

module.exports = class CrossServersApplesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ccssgivetheapples",
      aliases: ["ccssgiveapples", "ccssapples"],
      group: "roles",
      memberName: "ccssgivetheapples",
      description: "Assigns a role to users mentioned in a message. If they have the first role, the second role is assigned.\n Usage:ccssgivetheapples [messageID] [serverID] [channelID] [first role ID] [second role ID]",
      userPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: "messageIDs",
          prompt: "What messages would you like to get the user ids from?",
          type: "string",
        },
        {
            key: "serverID",
            prompt: "In what server is this message?",
            type: "string",
        },
        {
            key: "channelID",
            prompt: "In what channel is this message?",
            type: "string",
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

  run(message, { messageIDs, serverID, channelID, firstRoleID, secondRoleID }) {

    var allMessageIDs = messageIDs.split(" "); 
    const guild = message.client.guilds.cache.get(serverID); 
    if(!guild){
      return message.reply(`I can't find server with ID ${serverID} :pensive:`);
    }
    const channel = guild.channels.cache.get(channelID);
    if(!channel) {
      return message.reply(`I can't find channel with ID ${channelID} in server ${guild.name} :pensive:`);
    }
    allMessageIDs.forEach(message =>assignRoles(message, firstRoleID, secondRoleID, channel))

    function assignRoles(messageID, firstRoleID, secondRoleID, channel){
      channel.messages.fetch(messageID).then( msg => {
          if(msg.reactions.cache.get('👍') && msg.reactions.cache.get('👍').me){
            return message.reply("You already checked this message before!");
          }
          var content = msg.content.replace(/\D/g, " ");
          content = content.split(" ");
          var members = message.guild.members.cache;
          var bothRoles = [firstRoleID, secondRoleID];
          var ids = content.filter(e => e.length >= 16);
          var usersWithFirstRole = []
          var usersWithSecondRole = []
          var userFrequency = {}
          for (var i = 0; i < ids.length; i++){
            userFrequency[ids[i]] = userFrequency[ids[i]] ? userFrequency[ids[i]] + 1 : 1;
          }

          for (var i = 0; i < ids.length; i++){
            if(!members.get(ids[i])) {
              continue
            }
            var member = members.get(ids[i]);
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
          msg.react('👍')
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