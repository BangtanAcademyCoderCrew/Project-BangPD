const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { splitText } = require('../../common/discordutil');
const { BATId, BALId, BAGId, BADId, guildId } = require('../../config.json');
const ALL_GUILD_IDS = [BATId, BALId, BAGId, BADId, guildId];

module.exports = {
  data: new SlashCommandBuilder()
      .setName('getstudentprofile')
      .setDescription('Gets info of a students across BA servers')
      .setDefaultPermission(false)
      .addUserOption(option =>
          option.setName('user')
              .setDescription('The user you want to get their profile.')
              .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const user = options.getUser('user');
    const fields = [];

    const formatField = (displayName, value) => {
      const info = {
        name: `${displayName}: `,
        value: `${value}`,
        inline: false
      };
      return info;
    };

    await interaction.deferReply();
    let userInGuild = null;
    ALL_GUILD_IDS.forEach(guildId => {
      const guild = interaction.client.guilds.cache.get(guildId);
      if (guildId && !guild) return;
      userInGuild = guild.members.cache.find(u => u.id === user.id);
      if (!userInGuild) return;
      let roles = userInGuild.roles.cache.filter(role => role.name != '@everyone');
      if (interaction.guild == guildId) {
        roles = roles.map(role => `<@&${role.id}>`).join('\n');
      } else {
        roles = roles.map(role => role.name).join('\n');
      }
      if (roles.length > 1024) {
        roles.forEach(role => {
          fields.push(formatField(`Roles in ${guild.name}`, role));
        });
      } else {
        fields.push(formatField(`Roles in ${guild.name}`, roles));
      }
    });
    const displayName = userInGuild.displayName;
    const joinedDate = new Date(userInGuild.joinedAt).toLocaleString('ko-KR', { timeZone: 'UTC' });
    const createdAtDate = new Date(user.createdAt).toLocaleString('ko-KR', { timeZone: 'UTC' });

    fields.unshift(formatField(`Display Name`, `${displayName}`));
    fields.push(formatField(`Joined`, `${joinedDate} UTC`));
    fields.push(formatField(`Created`, `${createdAtDate} UTC`));
    const embed = new MessageEmbed()
        .setColor('#5445ff')
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .addFields(fields)
        .setTimestamp();
    interaction.followUp({ embeds: [embed] });


  }
};
