const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { BATId, BALId, BAGId } = require('./config.json');

const ALL_GUILD_IDS = [BATId, BALId, BAGId];

// TODO: needs permission 'MANAGE_ROLES'
module.exports = {
  data: new SlashCommandBuilder()
      .setName('getusersinserver')
      .setDescription('Gets a list of user ids that were mentioned in a message and checks if they are in the satellite servers.')
      .addStringOption(option =>
          option.setName('message_ids')
              .setDescription('The message id(s) you would like to get the user ids from')
              .setRequired(true))
      .addChannelOption(option =>
          option.setName('channel')
              .setDescription('The channel the message(s) are in')
              .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const messageIds = options.getString('message_ids');
    const channel = options.getChannel('channel');

    const allUserIdsPerGuild = {};
    ALL_GUILD_IDS.map((guildId) => {
      const guild = interaction.client.guilds.cache.get(guildId);
      allUserIdsPerGuild[guildId] = guild.members.cache.map(m => m.id);
    });

    const getUsersInGuild = (ids) => {
      const usersPerGuild = {};
      ALL_GUILD_IDS.map((guildId) => {
        usersPerGuild[guildId] = ids.filter(id => allUserIdsPerGuild[guildId].includes(id));
      });

      const guildGroupTypes = {
        All: '3 Servers',
        BAG: 'only BAG',
        BAL: 'only BAL',
        BAT: 'only BAT',
        BALandBAG: 'BAL and BAG',
        BALandBAT: 'BAL and BAT',
        BATandBAG: 'BAT and BAG',
      };

      const usersPerGuildGroup = {};
      usersPerGuildGroup[guildGroupTypes.BALandBAT] = usersPerGuild[BALId].filter(id => usersPerGuild[BATId].includes(id));
      usersPerGuildGroup[guildGroupTypes.BALandBAG] = usersPerGuild[BALId].filter(id => usersPerGuild[BAGId].includes(id));
      usersPerGuildGroup[guildGroupTypes.BATandBAG] = usersPerGuild[BATId].filter(id => usersPerGuild[BAGId].includes(id));
      usersPerGuildGroup[guildGroupTypes.All] = usersPerGuildGroup[guildGroupTypes.BALandBAT].filter(id => usersPerGuild[BAGId].includes(id));
      usersPerGuildGroup[guildGroupTypes.BAL] = usersPerGuild[BALId].filter(id => !usersPerGuild[BATId].includes(id)).filter(id => !usersPerGuild[BAGId].includes(id));
      usersPerGuildGroup[guildGroupTypes.BAT] = usersPerGuild[BATId].filter(id => !usersPerGuild[BALId].includes(id)).filter(id => !usersPerGuild[BAGId].includes(id));
      usersPerGuildGroup[guildGroupTypes.BAG] = usersPerGuild[BAGId].filter(id => !usersPerGuild[BATId].includes(id)).filter(id => !usersPerGuild[BALId].includes(id));
      return usersPerGuildGroup;
    };

    const checkUsersOnServer = (messageId) => {
      channel.messages.fetch(messageId).then(msg => {
        const userIds = msg.mentions.users.map(user => user.id);
        const usersPerGuildGrouped = getUsersInGuild(userIds);

        Object.entries(usersPerGuildGrouped).map(([key, value]) => {
          const attachment = new Discord.MessageAttachment(Buffer.from(`<@${value.join('>\n<@')}>`, 'utf-8'), 'usersID.txt');
          interaction.reply({ content: `Users in  ${key}`, files: [attachment] });
        });
      }).catch((error) => {
        console.log(error);
        interaction.reply({ content: `There was an error checking ${messageId} in channel <#${channel.id}>` });
      });
    };

    const allMessageIds = messageIds.split(' ');
    allMessageIds.map(messageId => checkUsersOnServer(messageId));
  },
};