const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { MessageEmbed } = require('discord.js');
const { BATId, BALId, BAGId, BADId, guildId } = require('../../config.json');
const ALL_GUILD_IDS = [BATId, BALId, BAGId, BADId, guildId];

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('profile')
    .setType(ApplicationCommandType.User)
    .setDefaultPermission(false),
  async execute(interaction) {

    const userId = interaction.targetId;
    const fields = [];
    const user = interaction.member.guild.members.cache.find(u => u.id === userId).user;

    await interaction.deferReply({ ephemeral: true });
    ALL_GUILD_IDS.forEach(guildId => {
      const guild = interaction.client.guilds.cache.get(guildId);
      if (guildId && !guild) return;
      const userInGuild = guild.members.cache.find(u => u.id === userId);
      if (!userInGuild) return;
      let roles = userInGuild.roles.cache.filter(role => role.name != '@everyone');
      if (interaction.guild == guildId) {
        roles = roles.map(role => `<@&${role.id}>`).join(', ');
      } else {
        roles = roles.map(role => role.name).join(', ');
      }
      const joinedDate = new Date(userInGuild.joinedAt).toLocaleString('ko-KR', { timeZone: 'UTC' });
      fields.push({
        name: `Roles at ${guild.name}`,
        value: `${roles}\n\n **Joined at:** ${joinedDate} UTC`,
        inline: true
      });
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
