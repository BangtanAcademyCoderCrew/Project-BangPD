const { Command } = require("discord.js-commando");
const { DateTime } = require("luxon");

module.exports = class ReminderCommand extends Command {
  constructor(client) {
    super(client, {
      name: "set-reminder",
      aliases: ["reminder", "remind"],
      group: "reminder",
      memberName: "set-reminder",
      description: "Sets a reminder",
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: "deadline",
          prompt: "When is the deadline in CST?",
          type: "string",
          validate: (deadline) => {
            const deadlineDateTime = DateTime.fromSQL(deadline, {
              zone: "America/Chicago",
            });
            if (!deadlineDateTime.isValid) {
              return "Invalid deadline provided. Please enter deadline in correct format. YYYY-MM-DD HH:MM";
            }

            const deadlineInUTC = deadlineDateTime.toUTC();
            const currentTimeUTC = DateTime.utc();

            if (currentTimeUTC > deadlineInUTC) {
              return "Deadline is in past. Invalid datetime provided.";
            }
            return true;
          },
        },
        {
          key: "channelID",
          prompt: "What channel would you like me to send the reminder?",
          type: "string",
        },
        {
          key: "timeInAdvance",
          prompt:
            "How much time before the deadline would you like the reminder to set off?",
          type: "string",
          oneOf: ['30m', '1h', '1d'],
        },
        {
          key: "reminderMessage",
          prompt: "What reminder message would you like me to send ?",
          type: "string",
        },
      ],
    });
  }

  run(message, { deadline, channelID, reminderMessage, timeInAdvance }) {
    const discordClient = message.client;
    const targetChannel = discordClient.channels.cache.get(channelID);
    const cst = "America/Chicago";

    const deadlineDateTime = DateTime.fromSQL(deadline, {
      zone: cst,
    });
    const deadlineInUTC = deadlineDateTime.toUTC();

    var reminderTime;

    switch (timeInAdvance) {
      case "30m":
        reminderTime = deadlineInUTC.minus({ minutes: 30 });
        break;
      case "1h":
        reminderTime = deadlineInUTC.minus({ hours: 1 });
        break;
      case "1d":
        reminderTime = deadlineInUTC.minus({ days: 1 });
        break;
    }

    const reminderTimeCST = reminderTime.setZone(cst);


    this.sendReminder(reminderTime, targetChannel, reminderMessage);

    const deadlineMessage =
      "Deadline (CST): " + deadlineDateTime.toLocaleString(DateTime.DATETIME_SHORT);
    const reminderHourBeforeMessage =
      "Reminder will trigger at (CST): " +
      reminderTimeCST.toLocaleString(DateTime.DATETIME_SHORT);
    const reminderPromise =
      "I will send reminder " +
      reminderTimeCST.toRelative() +
      " in channel : " +
      targetChannel.name;
    const newLine = "\n";

    const fullMessage = deadlineMessage.concat(
      newLine,
      reminderHourBeforeMessage,
      newLine,
      reminderPromise
    );

    return message.reply(fullMessage);
  }

  sendReminder(timeBeforeDeadline, channel, reminderMessage) {
    const currentTimeUTC = DateTime.utc();

    const delay = timeBeforeDeadline.toMillis() - currentTimeUTC.toMillis();
    // TODO: Maybe can use Duration
    if (delay > 0) {
      setTimeout(
        function () {
          channel.send(reminderMessage);
        },
        delay,
        channel,
        reminderMessage
      );
    }
  }
};
