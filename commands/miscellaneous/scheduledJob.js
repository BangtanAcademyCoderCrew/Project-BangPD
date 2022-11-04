const { SlashCommandBuilder } = require('@discordjs/builders');
const { startScheduledJob, stopScheduledJob, runScheduledJob } = require('../../scheduledJobs');
const cronValidator = require('cron-validator');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scheduledjob')
        .setDescription('Start or stop a scheduled job')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a scheduled job')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the schedule job (i.e. "giveApples")')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('schedule')
                        .setDescription('The cron schedule to override the default schedule. Default is "0 2 * * *" (daily at 2am)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
                subcommand
                    .setName('stop')
                    .setDescription('Stop a scheduled job')
                    .addStringOption(option =>
                        option.setName('name')
                            .setDescription('The name of the schedule job (i.e. giveApples)')
                            .setRequired(true)
                    )
        )
        .addSubcommand(subcommand =>
         subcommand
             .setName('runonce')
                .setDescription('Run a schedule job now only one time')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The name of the schedule job (i.e. giveApples)')
                        .setRequired(true)
                    )
        ),
    async execute(interaction) {
        const client = interaction.client;
        const options = interaction.options;
        const commandName = options.getSubcommand();
        const name = options.getString('name');
        const schedule = options.getString('schedule');

        // nightly at 2am America/Chicago timezone
        let cronSchedule = '0 2 * * *';

        if (name) {
            const scheduledJobsDirectory = './scheduledJobs';
            const scheduledJobFiles = fs.readdirSync(scheduledJobsDirectory).filter(file => file.endsWith('.js'));
            const jobFile = scheduledJobFiles.find((file) => file.includes(name));
            if (!jobFile) {
                return interaction.reply({ content: `There was no scheduled job with name "${name}" found. 🙁` });
            }
        }

        if (schedule) {
            const isValidSchedule = cronValidator.isValidCron(schedule);
            if (isValidSchedule) {
                cronSchedule = schedule;
            } else {
                return interaction.reply({ content: `${schedule} is not a valid cron schedule. 🙁` });
            }
        }

        if (commandName === 'start') {
            const isSuccessful = startScheduledJob(client, name, cronSchedule);
            if (isSuccessful) {
                return interaction.reply({ content: `Scheduled Job with name "${name}" has started. 🟢` });
            }
            return interaction.reply({ content: `Scheduled Job with name "${name}" could not be started. 🙁` });
        }

        if (commandName === 'stop') {
            const isSuccessful = stopScheduledJob(client, name);
            if (isSuccessful) {
                return interaction.reply({ content: `Scheduled Job with name "${name}" has stopped. 🔴` });
            }
            return interaction.reply({ content: `Scheduled Job with name "${name}" could not be stopped. 🙁` });
        }


        if (commandName === 'runonce') {
            const isSuccessful = runScheduledJob(client, name);
            if (isSuccessful) {
                return interaction.reply({ content: `Scheduled Job with name "${name}" has started. 🟢` });
            }
            return interaction.reply({ content: `Scheduled Job with name "${name}" could not be started. 🙁` });
        }
    }
};