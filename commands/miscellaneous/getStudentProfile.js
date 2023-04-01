const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { splitText } = require("../../common/discordutil");
const { BATId, BALId, BAGId, BADId, guildId } = require("../../config.json");

const ALL_GUILD_IDS = [BATId, BALId, BAGId, BADId, guildId];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getstudentprofile")
    .setDescription("Gets info of a students across BA servers")
    .setDefaultPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to get their profile.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { options } = interaction;
    const user = options.getUser("user");
    const fields = [];

    const formatStudentInfo = (guildName, value) => {
      const info = {
        name: `Roles at ${guildName}`,
        value: `${value}`,
        inline: true,
      };
      return info;
    };

    await interaction.deferReply();
    ALL_GUILD_IDS.forEach((guildId) => {
      const guild = interaction.client.guilds.cache.get(guildId);
      if (guildId && !guild) return;
      const userInGuild = guild.members.cache.find((u) => u.id === user.id);
      if (!userInGuild) return;
      let roles = userInGuild.roles.cache.filter(
        (role) => role.name != "@everyone"
      );
      if (interaction.guild == guildId) {
        roles = roles.map((role) => `<@&${role.id}>`).join("\n");
      } else {
        roles = roles.map((role) => role.name).join("\n");
      }
      const joinedDate = new Date(userInGuild.joinedAt).toLocaleString(
        "ko-KR",
        { timeZone: "UTC" }
      );
      const result = `${roles}\n\n **Joined at:** ${joinedDate} UTC`;
      if (result.length > 1024) {
        const results = splitText(result, "\n");
        results.forEach((result) => {
          fields.push(formatStudentInfo(guild.name, result));
        });
      } else {
        fields.push(formatStudentInfo(guild.name, result));
      }
    });
    const createdAtDate = new Date(user.createdAt).toLocaleString("ko-KR", {
      timeZone: "UTC",
    });
    fields.push({
      name: "Created at",
      value: `${createdAtDate} UTC`,
      inline: false,
    });
    const embed = new MessageEmbed()
      .setColor("#5445ff")
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .addFields(fields)
      .setTimestamp();
    interaction.followUp({ embeds: [embed] });
  },
};
