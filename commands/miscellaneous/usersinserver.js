const { Command } = require("discord.js-commando");
const Discord = require('discord.js');

module.exports = class GetUsersInServerCommand extends Command {
  constructor(client) {
    super(client, {
      name: "usersinserver",
      aliases: ["usersserver", "uos"],
      group: "miscellaneous",
      memberName: "usersinserver",
      description: "Gets a list of user ids that were mentioned in a message and checks if they are in the satellite servers.\n Usage:usersinservers [messageID] [channelID]",
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
      ],
    });
  }

  run(message, { messageIDs, channel }) {

    var allMessageIDs = messageIDs.split(" "); 
    allMessageIDs.forEach(message => checkUsersOnServer(message));
    const guildBALID = "819398172270264351";
    const guildBATID = "888439837256994823";
    const guildBAGID = "848725336366645259";
    const guildIDs = [guildBATID, guildBALID, guildBAGID]

    function checkUsersOnServer(messageID){
      channel.messages.fetch(messageID).then( msg => {
          var content = msg.content.replace(/\D/g, " ");
          content = content.split(" ");
          const ids = content.filter(e => e.length >= 16);
          var usersPerGuild = getUsersInGuild(ids, guildIDs);

          for (var i = 0; i < Object.keys(usersPerGuild).length; i++){
            var key = Object.keys(usersPerGuild)[i];
            const attachment = new Discord.MessageAttachment(Buffer.from(`<@${usersPerGuild[key].join(">\n<@")}>`, 'utf-8'), 'usersID.txt');
            message.channel.send(`Users in ${key}`, attachment);
          }
      }).catch(function(error) {
          console.log(error);
          message.channel.send(`There was an error checking ${messageID} in channel <#${channel.id}>`)
        });
    }

    function getUsersInGuild(ids, guildIDs){
      var usersPerGuild = {}
      for (var i = 0; i < guildIDs.length; i++){
        usersPerGuild[guildIDs[i]] = ids.filter(id => message.client.guilds.cache.get(guildIDs[i]).member(id));
      }
      var usersPerGuildGroup = {}
      usersPerGuildGroup["BAL and BAT"] = usersPerGuild[guildBALID].filter(id => usersPerGuild[guildBATID].includes(id)); 
      usersPerGuildGroup["BAL and BAG"] = usersPerGuild[guildBALID].filter(id => usersPerGuild[guildBAGID].includes(id));
      usersPerGuildGroup["BAT and BAG"] = usersPerGuild[guildBATID].filter(id => usersPerGuild[guildBAGID].includes(id));
      usersPerGuildGroup["3 Servers"] = usersPerGuildGroup["BAL and BAT"].filter(id => usersPerGuild[guildBAGID].includes(id));
      usersPerGuildGroup["only BAL"] = usersPerGuild[guildBALID].filter(id => !usersPerGuild[guildBATID].includes(id)).filter(id => !usersPerGuild[guildBAGID].includes(id));
      usersPerGuildGroup["only BAT"] = usersPerGuild[guildBATID].filter(id => !usersPerGuild[guildBALID].includes(id)).filter(id => !usersPerGuild[guildBAGID].includes(id));
      usersPerGuildGroup["only BAG"] = usersPerGuild[guildBAGID].filter(id => !usersPerGuild[guildBATID].includes(id)).filter(id => !usersPerGuild[guildBALID].includes(id));
      return usersPerGuildGroup;
    }
  }
};
