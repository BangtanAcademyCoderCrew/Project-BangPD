const cron = require('node-cron');
const Promise = require('promise');
const DiscordUtil = require('../common/discordutil');
const { DateTime, Duration } = require('luxon');
const { MessageAttachment } = require('discord.js');
const jobConfig = require('./kickNonBAMembersJobConfig.json');

const SATELLITE_GUILD_IDS = DiscordUtil.getSatelliteGuildIdsWithoutBAE();

let CURRENT_KICKNONBAMEMBERS_TASK = null;

const runKickNonBAMembersJob = async (client, environment, guildIds) => {
    const { logChannelId } = jobConfig[environment];
    const { descriptionMaxSize } = jobConfig[environment];
    const { color } = jobConfig[environment];
    const currentDateTimeCT = DateTime.utc().setZone('America/Chicago');
    const kickEmbedTitleBase = 'kickNonBAMembersJob';

    // get channel to log results
    const resultsChannel = client.channels.cache.get(logChannelId);
    if (!resultsChannel) {
        console.log(`Scheduled Job: ${kickEmbedTitleBase} - No results channel with id ${logChannelId} found to send updates to.`);
        return;
    }

    // gather all satellite servers
    const satelliteGuilds = DiscordUtil.getAllGuilds(guildIds, null, client);
    if (satelliteGuilds && satelliteGuilds.length === 0) {
        console.log(`Scheduled Job: ${kickEmbedTitleBase} - No satellite servers were found.`);
        if (resultsChannel) {
            const description = 'No satellite servers were found. 🙁';
            const errorEmbed = DiscordUtil.createScheduledJobEmbed(kickEmbedTitleBase, 'Error!', description, color);
            return resultsChannel.send({ embeds: [errorEmbed] });
        }
    }

    // send started job message
    if (resultsChannel) {
        const description = 'I\'ve started checking which students left the main server without leaving the satellite servers. They will be kicked from them shortly.';
        const embed = DiscordUtil.createScheduledJobEmbed(kickEmbedTitleBase, '🏁 Started!', description, color);
        await resultsChannel.send({ embeds: [embed] });
    }

    // kick non BA members
    const userIds = DiscordUtil.getNonBAMembers(null, client)[0];
    if (userIds.length > 0) {
        const [membersKicked, errorUsersPerServer] = await DiscordUtil.kickUsersOnServers(userIds, satelliteGuilds);

        // send split messages with all the kicked users
        const memberBatches = DiscordUtil.splitMessages(membersKicked.replaceAll('\n', ' ').trim(), descriptionMaxSize);
        await Promise.all(memberBatches.map(async (batch) => {
            const index = memberBatches.indexOf(batch);
            const title = `Users below were kicked! Message ${index + 1} of ${memberBatches.length}`;
            const embed = DiscordUtil.createScheduledJobEmbed(kickEmbedTitleBase, title, batch, color);
            if (resultsChannel) {
                await resultsChannel.send({ embeds: [embed] });
            }
        }));

        // parse all kicked user ids and ids of users that couldnt be kicked into txt files and send them
        const successAttachment = new MessageAttachment(Buffer.from(membersKicked, 'utf-8'), 'usersID.txt');
        const attachments = [successAttachment];
        Object.entries(errorUsersPerServer).forEach(([key, value]) => {
            // each server produces either the ids with error or ''
            if (value !== '') {
                const errorAttachment = new MessageAttachment(Buffer.from(value, 'utf-8'), `error${key}_userIds.txt`);
                attachments.push(errorAttachment);
            }
        });
        // well done bang pd nim!
        const jobEndDateTime = DateTime.utc().setZone('America/Chicago');
        const totalTimeElapsedInMs = jobEndDateTime.diff(currentDateTimeCT);
        const formattedRuntime = Duration.fromObject({ milliseconds: totalTimeElapsedInMs }).toFormat('hh:mm:ss');
        const description = 'A list of all user\'s ids that were kicked from at least one of the satellite servers are in `userIds.txt` attached in this message. If there were any errors kicking some users, there will also be a file attached with name `errorSERVERID_userIds.txt`.';
        const numberOfUsersKicked = (membersKicked.match(/>/g) || []).length;
        const fields = [
            { name: 'Total Runtime', value: `${formattedRuntime}` },
            { name: 'Users Kicked', value: `${numberOfUsersKicked}` }
        ];
        const embed = DiscordUtil.createScheduledJobEmbed(kickEmbedTitleBase, '🎉 Completed!', description, color, fields);
        await resultsChannel.send({ embeds: [embed], files: attachments });
    } else {
        // well done bang pd nim!
        const jobEndDateTime = DateTime.utc().setZone('America/Chicago');
        const totalTimeElapsedInMs = jobEndDateTime.diff(currentDateTimeCT);
        const formattedRuntime = Duration.fromObject({ milliseconds: totalTimeElapsedInMs }).toFormat('hh:mm:ss');
        const description = 'There were no users that were a member of a satellite server but not the main server.';
        const fields = [
            { name: 'Total Runtime', value: `${formattedRuntime}` },
            { name: 'Users Kicked', value: '0' }
        ];
        const embed = DiscordUtil.createScheduledJobEmbed(kickEmbedTitleBase, '🎉 Completed!', description, color, fields);
        await resultsChannel.send({ embeds: [embed] });
    }
};

module.exports = {
    name: 'kickNonBAMembersJob',
    async start(client, schedule, serverId) {
        if (CURRENT_KICKNONBAMEMBERS_TASK) {
            CURRENT_KICKNONBAMEMBERS_TASK.stop();
        }

        let guilds = SATELLITE_GUILD_IDS;
        let environment = 'BA';
        let jobSchedule = '';

        if (serverId === 'dev') {
            environment = 'dev';
            const { cronSchedule } = jobConfig['dev'];
            jobSchedule = schedule ? schedule : cronSchedule;
        } else {
            guilds = SATELLITE_GUILD_IDS.includes(serverId) ? [serverId] : SATELLITE_GUILD_IDS;
            const { cronSchedule } = jobConfig['BA'];
            jobSchedule = schedule ? schedule : cronSchedule;

        }

        CURRENT_KICKNONBAMEMBERS_TASK = cron.schedule(
            jobSchedule,
            () => {
                runKickNonBAMembersJob(client, environment, guilds);
            }, {
                scheduled: true,
                timezone: 'America/Chicago'
            });
    },
    async stop() {
        if (CURRENT_KICKNONBAMEMBERS_TASK) {
            CURRENT_KICKNONBAMEMBERS_TASK.stop();
        }
    },
    async run(client, serverId) {
        let guilds = SATELLITE_GUILD_IDS;
        let environment = 'BA';

        if (serverId === 'dev') {
            environment = 'dev';
        } else {
            guilds = SATELLITE_GUILD_IDS.includes(serverId) ? [serverId] : SATELLITE_GUILD_IDS;
        }

        await runKickNonBAMembersJob(client, environment, guilds);
    }
};