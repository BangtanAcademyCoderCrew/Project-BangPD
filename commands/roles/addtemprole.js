const { DateTime } = require("luxon");
const DiscordUtil = require('../../common/discordutil.js');
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temp-role')
    .setDescription('Adds a new role to a list of users for a limited time. Attach a csv or txt file with a list of all the usernames, one per line that you would like to add the role to. The format for the date to remove the role is YYYY-MM-DD HH:MM')
    .addStringOption(option => option.setName('deadline')
      .setDescription('When is the time you would like to remove the role in CST? Format YYYY-MM-DD HH:MM')
      .setRequired(true))
    .addRoleOption(option => option.setName('roleID')
      .setDescription('What role would you like to temporarily add to user?')
      .setRequired(true))
    .addStringOption(option => option.setName('fileURL')
      .setDescription('Add a file link if you haven\'t attached a file in the first message')
      .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const fileUrl = options.getString('fileUrl');
    const roleId = options.getRole('roleId');

    // Validate deadline
    const deadline = options.deadline;
    const deadlineDateTime = DateTime.fromSQL(deadline, {
      zone: "America/Chicago",
    });

    if (!deadlineDateTime.isValid) {
      return await interaction.reply('Invalid deadline provided. Please enter deadline in correct format. YYYY-MM-DD HH:MM');
    }

    const deadlineInUTC = deadlineDateTime.toUTC();
    const currentTimeUTC = DateTime.utc();

    if (currentTimeUTC > deadlineInUTC) {
      return await interaction.reply('Deadline is in past. Invalid datetime provided');
    }

    // Attachment
    const attachment = interaction.attachments.values().next().value;
    let attachmentURL;
    if (!attachment && fileURL.length > 1) {
      attachmentURL = fileUrl;
    }
    if (attachment) {
      attachmentURL = attachment.url;
    }
    else {
      await interaction.reply("No valid file")
    }

    // Add role and remove at deadline
    DiscordUtil.openFileAndDo(attachmentURL, (member) => { member.roles.add([roleId]); }, message);
    this.removeRoleAtDeadline(deadlineInUTC, interaction.channel, roleId, attachmentURL, message);

    const deadlineMessage =
      "Deadline (CST): " + deadlineDateTime.toLocaleString(DateTime.DATETIME_SHORT);
    const reminderPromise =
      "I will send reminder";
    const newLine = "\n";

    const fullMessage = deadlineMessage.concat(
      newLine,
      newLine,
      reminderPromise
    );

    return message.reply(fullMessage);
  },
  removeRoleAtDeadline(timeToRemoveRole, channel, roleID, attachmentURL, message) {
    const currentTimeUTC = DateTime.utc();

    const timeLeftBeforeRemovingRole = timeToRemoveRole.toMillis() - currentTimeUTC.toMillis();
    // TODO: Maybe can use Duration
    if (timeLeftBeforeRemovingRole > 0) {
      setTimeout(
        function () {
          DiscordUtil.openFileAndDo(attachmentURL, function (member) { member.roles.remove([roleID]); }, message);
          channel.send(`The role <@&${roleId}> has been removed`);
        },
        timeLeftBeforeRemovingRole,
        channel
      );
    }
  }
}
