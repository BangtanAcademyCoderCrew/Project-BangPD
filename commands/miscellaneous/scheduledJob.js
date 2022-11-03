const { SlashCommandBuilder } = require('@discordjs/builders');
const { startScheduledJob: scheduledJob, stopScheduledJob } = require('../../scheduledJobs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scheduledjob')
        .setDescription('Start or stop a scheduled job')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a scheduled job')
                .addStringOption(option =>
                    option.setName('scheduled_job_name')
                        .setDescription('The name of the schedule job (i.e. giveApples)')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
                subcommand
                    .setName('stop')
                    .setDescription('Stop a scheduled job')
                    .addStringOption(option =>
                        option.setName('scheduled_job_name')
                            .setDescription('The name of the schedule job (i.e. giveApples)')
                            .setRequired(true)
                    )
        ),
    async execute(interaction) {
        const client = interaction.client;
        const options = interaction.options;
        const commandName = options.getSubcommand();
        const jobName = options.getString('scheduled_job_name');

        if (commandName === 'start') {
            const isSuccessful = scheduledJob(client, jobName);
            if (isSuccessful) {
                return interaction.reply({ content: `Scheduled Job with name ${jobName} has started. 🟢` });
            }
            return interaction.reply({ content: `Scheduled Job with name ${jobName} could not be started.` });
        }

        if (commandName === 'stop') {
            const isSuccessful = stopScheduledJob(client, jobName);
            if (isSuccessful) {
                return interaction.reply({ content: `Scheduled Job with name ${jobName} has stopped. 🔴` });
            }
            return interaction.reply({ content: `Scheduled Job with name ${jobName} could not be stopped.` });
        }
    }
};