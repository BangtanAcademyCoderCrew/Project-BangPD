const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rollcall')
    .setDescription('Starts rollcall. You will need the role ids that won\'t be rollcalled and the rollcall role id.')
    .addStringOption(option => option.setName('role_exception_ids')
      .setDescription('What roles are needed to not be rollcalled (ex. Active Student, level 4, etc)?')
      .setRequired(true))
    .addRoleOption(option => option.setName('rollcall_role_id')
      .setDescription('Rollcall Role ID')
      .setRequired(true))
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const roleExceptionIDs = options.getString('role_exception_ids').split(' ');
    const rollcallRole = options.getRole('rollcall_role_id');
    const members = interaction.guild.members.cache;

    await interaction.deferReply();

    let rollcalled = 0;
    let activeMembers = 0;

    for (const [, memberInfo] of members.entries()) {
      if (memberInfo.user.bot) {
        continue;
      }
      let isActive = false;

      for (let i = 0; i < roleExceptionIDs.length; i++) {
        const roleId = roleExceptionIDs[i].replace(/\D/g, '');
        if (memberInfo.roles.cache.get(roleId)) {
          isActive = true;
          activeMembers++;
          break;
        }
      }
      if (!isActive) {
        memberInfo.roles.add([rollcallRole]);
        rollcalled++;
      }
    }
    return interaction.followUp({ content: `Rollcall done. ${rollcalled} are in roll call. ${activeMembers} active members.` });
  }
};
