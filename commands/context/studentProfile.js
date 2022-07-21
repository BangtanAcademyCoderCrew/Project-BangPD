const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { MessageEmbed } = require('discord.js');
const { splitText } = require('../../common/discordutil');
const { BATId, BALId, BAGId, BADId, guildId } = require('../../config.json');
const ALL_GUILD_IDS = [BATId, BALId, BAGId, BADId, guildId];

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('get student profile')
    .setType(ApplicationCommandType.User)
    .setDefaultPermission(false),
  async execute(interaction) {

    const userId = interaction.targetId;
    const fields = [];
    const user = interaction.member.guild.members.cache.find(u => u.id === userId).user;

    const formatStudentInfo = (guildName, value) => {
      const info = {
        name: `Roles at ${guildName}`,
        value: `${value}`,
        inline: true
      };
      return info;
    };

    await interaction.deferReply({ ephemeral: true });
    ALL_GUILD_IDS.forEach(guildId => {
      const guild = interaction.client.guilds.cache.get(guildId);
      if (guildId && !guild) return;
      const userInGuild = guild.members.cache.find(u => u.id === userId);
      if (!userInGuild) return;
      let roles = userInGuild.roles.cache.filter(role => role.name != '@everyone');
      if (interaction.guild == guildId) {
        roles = roles.map(role => `<@&${role.id}>`).join('\n');
      } else {
        roles = roles.map(role => role.name).join('\n');
      }
      const joinedDate = new Date(userInGuild.joinedAt).toLocaleString('ko-KR', { timeZone: 'UTC' });
      const result = `${roles}\n\n **Joined at:** ${joinedDate} UTC`;
      if (result.length > 1024) {
        const results = splitText(result, '\n');
        results.forEach(result => {
          fields.push(formatStudentInfo(guild.name, result));
        });
      } else {
        fields.push(formatStudentInfo(guild.name, result));
      }
    });
    const createdAtDate = new Date(user.createdAt).toLocaleString('ko-KR', { timeZone: 'UTC' });
    fields.push({
      name: 'Created at',
      value: `${createdAtDate} UTC`,
      inline: false
    });
    const embed = new MessageEmbed()
      .setColor('#5445ff')
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .addFields(fields)
      .setTimestamp();
    interaction.followUp({ embeds: [embed], ephemeral: true });


  }
};
