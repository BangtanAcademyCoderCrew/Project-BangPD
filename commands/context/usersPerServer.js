const Discord = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { BALId, BATId, BAGId } = require('../../config.json');

const ALL_GUILD_IDS = [BATId, BALId, BAGId];

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('get users per server')
    .setType(3)
    .setDefaultPermission(false),
  async execute(interaction) {
    const messageId = interaction.targetId;
    const channelId = interaction.channelId;
    const guildId = interaction.guildId;

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    const allUserIdsPerGuild = {};
    ALL_GUILD_IDS.map((id) => {
      const currentGuild = interaction.client.guilds.cache.get(id);
      if (id && !currentGuild) {
        return interaction.followUp({ content:`I can't find server with ID ${id} :pensive:`, ephemeral: true });
      }
      allUserIdsPerGuild[id] = currentGuild.members.cache.map(m => m.id);
    });

    const getUsersInGuild = (ids) => {
      const usersPerGuild = {};
      ALL_GUILD_IDS.map((i) => {
        usersPerGuild[i] = ids.filter(id => allUserIdsPerGuild[guildId].includes(id));
      });

      const groups = {
        All: '3 Servers',
        BAG: 'only BAG',
        BAL: 'only BAL',
        BAT: 'only BAT',
        BALandBAG: 'BAL and BAG',
        BALandBAT: 'BAL and BAT',
        BATandBAG: 'BAT and BAG'
      };

      const usersPerGroup = {};
      usersPerGroup[groups.BALandBAT] = usersPerGuild[BALId].filter(id => usersPerGuild[BATId].includes(id));
      usersPerGroup[groups.BALandBAG] = usersPerGuild[BALId].filter(id => usersPerGuild[BAGId].includes(id));
      usersPerGroup[groups.BATandBAG] = usersPerGuild[BATId].filter(id => usersPerGuild[BAGId].includes(id));
      usersPerGroup[groups.All] = usersPerGroup[groups.BALandBAT].filter(id => usersPerGuild[BAGId].includes(id));
      usersPerGroup[groups.BAL] = usersPerGuild[BALId].filter(id => !usersPerGuild[BATId].includes(id)).filter(id => !usersPerGuild[BAGId].includes(id));
      usersPerGroup[groups.BAT] = usersPerGuild[BATId].filter(id => !usersPerGuild[BALId].includes(id)).filter(id => !usersPerGuild[BAGId].includes(id));
      usersPerGroup[groups.BAG] = usersPerGuild[BAGId].filter(id => !usersPerGuild[BATId].includes(id)).filter(id => !usersPerGuild[BALId].includes(id));
      return usersPerGroup;
    };

    channel.messages.fetch(messageId).then(msg => {
      const userIds = msg.mentions.users.map(user => user.id);
      const usersPerGuildGrouped = getUsersInGuild(userIds);

      Object.entries(usersPerGuildGrouped).map(([key, value]) => {
        const attachment = new Discord.MessageAttachment(Buffer.from(`<@${value.join('>\n<@')}>`, 'utf-8'), 'usersID.txt');
        return interaction.followUp({ content: `Users in  ${key}`, files: [attachment], ephemeral: true });
      });
    }).catch((error) => {
      console.log(error);
      return interaction.followUp({ content: `There was an error checking ${messageId} in channel <#${channelId}> <a:shookysad:949689086665437184>`, ephemeral: true });
    });
  }
};
