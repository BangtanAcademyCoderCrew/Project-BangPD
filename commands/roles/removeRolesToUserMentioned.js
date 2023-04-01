const { MessageAttachment } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removerolestouserinmessage")
    .setDescription("Removes a role to users that were mentioned in a message.")
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
        .setDescription("What role would you like to remove from user?")
        .setRequired(true)
    )
    .setDefaultPermission(false),
  async execute(interaction) {
    const { options } = interaction;
    const messageIds = options.getString("message_ids");
    const channel = options.getChannel("channel");
    const roleToRemove = options.getRole("role");

    await interaction.deferReply();

    const checkIDs = (messageId, role) => {
      channel.messages
        .fetch(messageId)
        .then((msg) => {
          const content = msg.content.replace(/\D/g, " ").split(" ");
          const ids = content.filter((e) => e.length >= 16);
          const members = interaction.guild.members.cache.filter((member) =>
            ids.includes(member.id)
          );
          let membersWithRoleRemoved = "";
          members.forEach((member) => {
            member.roles.remove([role]);
            membersWithRoleRemoved += `<@${member.user.id}>\n`;
          });
          const attachment = new MessageAttachment(
            Buffer.from(membersWithRoleRemoved, "utf-8"),
            "usersID.txt"
          );
          interaction.followUp({
            content: `Users in message ${messageId} removed role ${role}`,
            files: [attachment],
          });
        })
        .catch((error) => {
          console.error(error);
          interaction.followUp({
            content: `Message with ID ${messageId} wasn't found in channel <#${channel.id}>`,
          });
        });
    };

    const allMessageIDs = messageIds.split(" ");
    return allMessageIDs.forEach((message) => checkIDs(message, roleToRemove));
  },
};
