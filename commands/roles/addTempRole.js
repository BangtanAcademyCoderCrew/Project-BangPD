const { DateTime } = require("luxon");
const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temp-role')
    .setDescription('Adds a role to users for a limited time. Attach a csv/txt file with a list of usernames, 1 per line')
    .addStringOption(option => option.setName('deadline')
      .setDescription('When is the time you would like to remove the role in CST? Format YYYY-MM-DD HH:MM')
      .setRequired(true))
    .addRoleOption(option => option.setName('role_id')
      .setDescription('What role would you like to temporarily add to user?')
      .setRequired(true))
    .addStringOption(option => option.setName('file_url')
      .setDescription('Add a file link instead of attachment. CSV or TXT file should list all usernames 1 per line')
      .setRequired(true))
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const fileUrl = options.getString('file_url');
    const roleId = options.getRole('role_id');

    await interaction.deferReply();

    // Validate deadline
    const deadline = options.getString('deadline');
    const deadlineDateTime = DateTime.fromSQL(deadline, {
      zone: "America/Chicago",
    });

    if (!deadlineDateTime.isValid) {
      return await interaction.reply({ content:'Invalid deadline provided. Please enter deadline in correct format. YYYY-MM-DD HH:MM'});
    }

    const deadlineInUTC = deadlineDateTime.toUTC();
    const currentTimeUTC = DateTime.utc();

    if (currentTimeUTC > deadlineInUTC) {
      return await interaction.reply({ content:'Invalid deadline provided. Deadline is in past.'});
    }

    // Handle attachment
    const attachment = interaction.attachments?.values()?.next()?.value;
    let attachmentURL;
    if (!attachment && fileUrl?.length > 1) {
      attachmentURL = fileUrl;
    }
    else if (attachment) {
      attachmentURL = attachment.url;
    }
    else {
      return interaction.reply({ content: "No valid file"})
    }

    // Define removeRole
    const removeRoleAtDeadline = (timeToRemoveRole, channel, roleToRemoveId, attachmentURL, message) => {
      const currentTimeUTC = DateTime.utc();

      const timeLeftBeforeRemovingRole = timeToRemoveRole.toMillis() - currentTimeUTC.toMillis();
      // TODO: Maybe can use Duration
      if (timeLeftBeforeRemovingRole > 0) {
        setTimeout(
          () => {
            DiscordUtil.openFileAndDo(attachmentURL, (member) => { member.roles.remove([roleToRemoveId]); }, message);
            interaction.reply({ content:`The role ${roleToRemoveId} has been removed`});
          },
          timeLeftBeforeRemovingRole,
          channel
        );
      }
    }

    // Add role and remove at deadline
    DiscordUtil.openFileAndDo(attachmentURL, (member) => { member.roles.add([roleId]); }, interaction);
    removeRoleAtDeadline(deadlineInUTC, interaction.channel, roleId, attachmentURL, interaction);

    const removalPromise =
      `I will remove the role ${roleToRemoveId} on:`;
    const deadlineMessage =
      `Deadline (CST): ${deadlineDateTime.toLocaleString(DateTime.DATETIME_SHORT)}`;
    const newLine = "\n";

    const fullMessage = removalPromise.concat(
      newLine,
      newLine,
      deadlineMessage
    );

    return interaction.reply({ content: fullMessage});
  }
}
