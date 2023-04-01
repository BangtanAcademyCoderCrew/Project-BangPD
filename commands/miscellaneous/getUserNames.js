const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const got = require("got");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getusernames")
    .setDescription(
      "Gets a list of user nicknames and names from a csv/txt file with list of all the user ids"
    )
    .addStringOption((option) =>
      option
        .setName("file_url")
        .setDescription(
          "The url of the csv/txt with list of user ids, one per line"
        )
        .setRequired(true)
    )
    .setDefaultPermission(false),
  async execute(interaction) {
    const { options } = interaction;
    const fileUrl = options.getString("file_url");
    await interaction.deferReply();

    const userNicknamesAndTags = [];
    try {
      const response = await got(fileUrl);
      const csv = response.body;
      const userIds = csv
        .trim()
        .split(/\r?\n/)
        .map((id) => id.replace(/[^\d]/g, ""));
      const users = interaction.client.users.cache.filter((u) =>
        userIds.includes(u.id)
      );
      const members = interaction.guild.members.cache.filter((m) =>
        userIds.includes(m.id)
      );

      userIds.forEach((userId) => {
        const foundUser = users.find((u) => u.id === userId);
        if (!foundUser) {
          return interaction.followUp({
            content: `User ${userId} not found <a:shookysad:949689086665437184>`,
          });
        }
        if (foundUser.bot) {
          return;
        }
        const foundMember = members.find((m) => m.id === userId);
        if (!foundMember) {
          return interaction.followUp({
            content: `Member ${userId} not found in server <a:shookysad:949689086665437184>`,
          });
        }
        const nicknameOrUserName =
          foundMember.displayName || foundUser.username;
        userNicknamesAndTags.push(`${nicknameOrUserName} ${foundUser.tag}`);
      });
    } catch (error) {
      console.log(error);
    }
    const attachment = new Discord.MessageAttachment(
      Buffer.from(`${userNicknamesAndTags.join("\n")}`, "utf-8"),
      "userNames.txt"
    );
    interaction.followUp({
      content: "User(s) nicknames and tags",
      files: [attachment],
    });
  },
};
