const { SlashCommandBuilder } = require('@discordjs/builders');
const { DateTime } = require('luxon');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setreminder')
    .setDescription('Sets a reminder')
    .addStringOption(option =>
      option.setName('deadline')
        .setDescription('The deadline in CST in YYYY-MM-DD HH:MM format')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the reminder')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('time_in_advance')
        .setDescription('The time before the deadline you would like the reminder to set off')
        .addChoice('30 min', '30m')
        .addChoice('1 hour', '1h')
        .addChoice('1 day', '1d')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reminder_message')
        .setDescription('The reminder message to send to channel')
        .setRequired(true))
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const deadline = options.getString('deadline');
    const channel = options.getChannel('channel');
    const timeInAdvance = options.getString('time_in_advance');
    const message = options.getString('reminder_message');
    const cst = 'America/Chicago';

    await interaction.deferReply();

    const deadlineDateTime = DateTime.fromSQL(deadline, {
      zone: cst
    });
    if (!deadlineDateTime.isValid) {
      interaction.reply({ content: 'Invalid deadline provided. Please enter deadline in correct format. YYYY-MM-DD HH:MM' });
      return;
    }

    const deadlineInUTC = deadlineDateTime.toUTC();
    const currentTimeUTC = DateTime.utc();
    if (currentTimeUTC > deadlineInUTC) {
      interaction.reply({ content: 'Invalid deadline provided. Deadline is in past.' });
      return;
    }

    let reminderTime;
    switch (timeInAdvance) {
      case '30m':
        reminderTime = deadlineInUTC.minus({ minutes: 30 });
        break;
      case '1h':
        reminderTime = deadlineInUTC.minus({ hours: 1 });
        break;
      case '1d':
        reminderTime = deadlineInUTC.minus({ days: 1 });
        break;
    }

    this.sendReminder(reminderTime, channel, message);

    const reminderTimeCST = reminderTime.setZone(cst);
    const deadlineMessage =
      'Deadline (CST): ' +
      deadlineDateTime.toLocaleString(DateTime.DATETIME_SHORT);
    const reminderHourBeforeMessage =
      'Reminder will trigger at (CST): ' +
      reminderTimeCST.toLocaleString(DateTime.DATETIME_SHORT);
    const reminderPromise =
      'I will send reminder ' +
      reminderTimeCST.toRelative() +
      ' in channel : ' +
      channel.name;
    const newLine = '\n';

    const fullMessage = deadlineMessage.concat(
      newLine,
      reminderHourBeforeMessage,
      newLine,
      reminderPromise
    );
    interaction.reply({ content: fullMessage });
  },
  sendReminder(timeBeforeDeadline, channel, message) {
    const currentTimeUTC = DateTime.utc();
    const delay = timeBeforeDeadline.toMillis() - currentTimeUTC.toMillis();
    if (delay > 0) {
      setTimeout(
        () => {
          channel.send(message);
        },
        delay,
        channel,
        message
      );
    }
  }
};