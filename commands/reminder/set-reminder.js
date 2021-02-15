const { Command } = require("discord.js-commando");
const { DateTime } = require("luxon");
const AWS = require("aws-sdk");
const { reminderStateMachineArn } = require("../../config.json");


module.exports = class ReminderCommand extends Command {
  constructor(client) {
    super(client, {
      name: "set-reminder",
      aliases: ["reminder", "remind"],
      group: "reminder",
      memberName: "set-reminder",
      description: "Sets a reminder 1 hour before deadline.",
      args: [
        {
          key: "deadline",
          prompt: "When is the deadline?",
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
          key: "mentionRole",
          prompt:
            "Would you like to mention any role with this reminder message?",
          type: "string",
        },
        
        {
          key: "reminderMessage",
          prompt: "What reminder message would you like me to send ?",
          type: "string",
        },
      ],
    });
  }

  run(message, { deadline, channelID, reminderMessage, timeInAdvance, mentionRole}) {
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

    this.setReminder(
      reminderTime,
      targetChannel,
      reminderMessage,
      message.author.id,
      message,
      mentionRole
    );

    const deadlineMessage =
      "Deadline: " + deadlineDateTime.toLocaleString(DateTime.DATETIME_SHORT);
    const reminderHourBeforeMessage =
      "Reminder will trigger at: " +
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

  setReminder(reminderTime, channel, reminderMessage, author, message, mentionRole) {
    AWS.config.loadFromPath("./config.json");
    AWS.config.update({ region: "us-east-2" });

    const stepFunctions = new AWS.StepFunctions();

    const name_prefix_divider = "-";
    const name_sf = channel.name.concat(
      name_prefix_divider,
      author,
      name_prefix_divider,
      channel.id,
      name_prefix_divider,
      reminderTime.toMillis()
    );

    const currentTimeUTC = DateTime.utc();

    if (currentTimeUTC < reminderTime) {
      var params = {
        stateMachineArn: reminderStateMachineArn,
        input: JSON.stringify({
          messageToRemind: reminderMessage,
          targetChannel: channel.id,
          deadline: reminderTime.toISO(),
          mentionRole: mentionRole,
        }),
        name: name_sf,
      };
      stepFunctions.startExecution(params, function (err, data) {
        if (err) {
          message.reply(
            "An error was encountered when setting up the reminder. Please try again."
          );
          console.log(err);
        }
      });
    } else{
      message.reply(
        "The reminder is invalid as it is set to before the current time."
      );
    }

  }
};
