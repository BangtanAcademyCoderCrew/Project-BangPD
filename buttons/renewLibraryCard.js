const { guildId } = require("../config.json");
const {
  redAppleRoleId,
  activeStudentRoleId,
  libraryCardRoleId,
  checkInRoleId,
} = require("./buttonsConfig.json");

module.exports = {
  name: "renewLibraryCard",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {GuildMember} member
   */
  async run(interaction, member) {
    await interaction.deferReply({ ephemeral: true });

    if (member.roles.cache.has(libraryCardRoleId)) {
      interaction.followUp({
        content: "You already have your library card!",
        ephemeral: true,
      });
      return;
    }

    const guildMain = interaction.client.guilds.cache.get(guildId);
    const memberInBA = guildMain.members.cache.find(
      (m) => m.id == interaction.member.id
    );

    if (
      member.roles.cache.has(checkInRoleId) &&
      (memberInBA.roles.cache.has(redAppleRoleId) ||
        memberInBA.roles.cache.has(activeStudentRoleId))
    ) {
      await member.roles.add([libraryCardRoleId]);
      interaction.followUp({
        content: "You got your library card renewed! 🎫",
        ephemeral: true,
      });
      return;
    }

    interaction.followUp({
      content:
        "Oops! You need the Check-In Role and the Active Student role to renew your card :pensive:",
      ephemeral: true,
    });
  },
};
