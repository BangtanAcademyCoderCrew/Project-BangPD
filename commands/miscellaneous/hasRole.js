const { MessageAttachment } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { errorEmojiId } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hasrole")
    .setDescription(
      "Gets a list of user ids that were mentioned in a message and see if they have a role or not."
    )
    .addStringOption((option) =>
      option
        .setName("message_ids")
        .setDescription(
          "What messages would you like to get the user ids from?"
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("In what channel is this message?")
        .addChannelTypes([
          ChannelType.GuildText,
          ChannelType.GuildPublicThread,
          ChannelType.GuildPrivateThread,
        ])
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("What's the role to check?")
        .setRequired(true)
    )
    .setDefaultPermission(false),
  async execute(interaction) {
    const { options } = interaction;
    const messageIds = options.getString("message_ids");
    const roleId = options.getRole("role").id;
    const channel = options.getChannel("channel");

    await interaction.deferReply();

    const hasRequiredRole = (ids, roleID) => {
      const usersWithRole = Array.from(
        interaction.guild.roles.cache.get(roleID).members.keys()
      );
      const haveTheRequiredRole = ids.filter((id) =>
        usersWithRole.includes(id)
      );
      return haveTheRequiredRole;
    };

    const checkIDs = (messageID) => {
      channel.messages
        .fetch(messageID)
        .then((msg) => {
          const content = msg.content.replace(/\D/g, " ").split(" ");
          const ids = content.filter((e) => e.length >= 16);
          const usersWithRequiredRole = hasRequiredRole(ids, roleId);
          const usersWithoutRequiredRole = ids.filter(
            (id) => !usersWithRequiredRole.includes(id)
          );
          const attachmentUsersWithRole = new MessageAttachment(
            Buffer.from(`<@${usersWithRequiredRole.join(">\n<@")}>`, "utf-8"),
            "user_with_role.txt"
          );
          const attachmentUsersWithoutRole = new MessageAttachment(
            Buffer.from(
              `<@${usersWithoutRequiredRole.join(">\n<@")}>`,
              "utf-8"
            ),
            "notActiveStudents.txt"
          );
          interaction.followUp({
            content: `Users in message ${messageID} who are active`,
            files: [attachmentUsersWithRole],
          });
          interaction.followUp({
            content: `Users in message ${messageID} who are not active`,
            files: [attachmentUsersWithoutRole],
          });
        })
        .catch((error) => {
          console.error(error);
          interaction.followUp({
            content: `Message with ID ${messageID} wasn't found in channel <#${channel.id}> ${errorEmojiId}`,
          });
        });
    };

    const allMessageIDs = messageIds.split(" ");
    allMessageIDs.forEach((message) => checkIDs(message));
  },
};
