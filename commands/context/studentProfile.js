const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9')
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

    await interaction.deferReply();
    ALL_GUILD_IDS.forEach(guildId => {
      const guild = interaction.client.guilds.cache.get(guildId);
      if (guildId && !guild) return;
      const userInGuild = guild.members.cache.find(u => u.id === userId);
      if (!userInGuild) return;
      const roles = userInGuild.roles.cache.map(role => role.name).filter(role => role != '@everyone').join(', ');
      fields.push({
        name: `Roles at ${guild.name}`,
        value: roles,
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
    interaction.followUp({ embeds: [embed] });


  }
};
