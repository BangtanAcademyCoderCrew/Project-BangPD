const cron = require('node-cron');
const Promise = require('promise');
const { batchItems, fetchAllMessagesByChannelSince, getGuildIdsWithoutBAE, sendGiveApplesEmbed } = require('../common/discordutil');
const { DateTime, Duration } = require('luxon');
const { MessageAttachment } = require('discord.js');
const appleConfig = require('./giveApplesConfig.json');

const ALL_GUILD_IDS = getGuildIdsWithoutBAE();

let CURRENT_APPLE_TASK = null;

const getLogbookMessagesToCheck = async (messages) => {
    const ignoreReactionName = 'yoongerine';
    return messages.filter(m => {
        const hasAlreadyBeenChecked = m.reactions.cache.has('👍') && m.reactions.cache.get('👍').me;

        // i.e. kckc class
        const ignoreMessageReaction = m.reactions.cache.find(r => r.emoji.name.includes(ignoreReactionName));
        const isMarkedToIgnore = ignoreMessageReaction !== undefined;

        const messageContent = m.content.replace(/\D/g, ' ').split(' ');
        const userIds = messageContent.filter(e => e.length >= 16);

        return !hasAlreadyBeenChecked && !isMarkedToIgnore && userIds.length > 0;
    });
};

const sendErrorEmbed = async (channel, description) => {
    const title = 'Error!';
    await sendGiveApplesEmbed(channel, title, description);
};

const sendLogEmbed = async (channel, description, thumbnail = '') => {
    await sendGiveApplesEmbed(channel, '', description, [], thumbnail);
};

const sendRolesChanged = async (channel, userIds, role, type) => {
    const arrayIds = Array.from(userIds.values());
    const formattedIds = arrayIds.map((id) => `<@${id}>`);
    const batches = batchItems(formattedIds);
    await Promise.all(batches.map(async (batch) => {
        const index = batches.indexOf(batch);
        const action = type === 'rollCall' ? 'Removed' : 'Assigned';
        const title = `${action} ${role} Role! Batch ${index + 1} of ${batches.length}!`;
        if (channel && index === batches.length - 1) {
            const attachmentContents = formattedIds.join('\n');
            const attachment = new MessageAttachment(Buffer.from(attachmentContents, 'utf-8'), `usersID-${type}.txt`);
            await sendGiveApplesEmbed(channel, title, batch.join(' '), []);
            await channel.send({ files: [attachment] });
        } else {
            await sendGiveApplesEmbed(channel, title, batch.join(' '));
        }
    }));
};

const runGiveApplesJob = async (client, environment, guildIds) => {
    const { guildId } = appleConfig[environment];
    const guildWithApples = await client.guilds.cache.get(guildId);
    const currentDateTimeCT = DateTime.utc().setZone('America/Chicago');
    const messagesSinceDateTime = currentDateTimeCT.minus({ days: 1 });

    const messagesWithApplesApplied = [];
    let logbookUserIds = [];
    const membersNeedingApples = [];
    const membersNeedingOnlyRedApples = new Set();
    const usersWithGreenAppleAdded = new Set();
    const usersWithRedAppleAdded = new Set();
    const usersWithNoApplesAdded = new Set();
    const usersWithRollCallRemoved = new Set();
    const usersWithActiveStudentAdded = new Set();

    const { greenAppleRoleId, redAppleRoleId, rollCallRoleId, activeStudentRoleId, logChannelId } = appleConfig[environment];

    const getAllLogbookChannels = () => {
        const logbookChannelNameStem = 'class-n-club-logbook';

        if (environment === 'dev') {
            const clientChannels = client.channels.cache;
            return clientChannels.filter((c) => c.name.toLowerCase().includes(logbookChannelNameStem));
        } else {
            return guildIds.map((id) => {
                const guild = client.guilds.cache.get(id);
                const clientChannels = guild.channels.cache;
                const channelWithStem = clientChannels.find((c) => c.name.toLowerCase().includes(logbookChannelNameStem));
                if (channelWithStem) {
                    return channelWithStem;
                }
            });
        }
    };

    const setLogbookUserIds = (message, userIds) => {
        const usersInMessage = Array.from(message.client.users.cache.filter(u => userIds.includes(u.id)).values());
        const messageUserIds = usersInMessage.map(user => user.id);
        logbookUserIds = logbookUserIds.concat(messageUserIds);
        if (messageUserIds.length > 0) {
            messagesWithApplesApplied.push(message);
        }
    };

    const setApplesToGive = async (channel) => {
        const messages = await fetchAllMessagesByChannelSince(channel, messagesSinceDateTime);
        if (messages.size === 0) {
            console.log(`Scheduled Job: giveApples - No logbooks were posted yesterday in guild: ${channel.guild.name} channel: ${channel.id}`);
            return;
        }

        const filteredMessages = await getLogbookMessagesToCheck(messages);
        if (filteredMessages.size === 0) {
            console.log(`Scheduled Job: giveApples - All logbooks posted yesterday in guild: ${channel.guild.name} channel: ${channel.id} have already been checked`);
            return;
        }

        filteredMessages.map(message => {
            const messageContent = message.content.replace(/\D/g, ' ').split(' ');
            const userIds = messageContent.filter(e => e.length >= 16);
            const filteredMembers = Array.from(guildWithApples.members.cache.filter(member => userIds.includes(member.user.id)).values());
            const hasRedAppleReaction = message.reactions.cache.has('🍎');
            if (hasRedAppleReaction) {
                // i.e. homework helper logbook
                if (filteredMembers.length > 0) {
                    messagesWithApplesApplied.push(message);
                }
                filteredMembers.forEach((m) => membersNeedingOnlyRedApples.add(m));
            } else {
                // i.e. homework logbook
                setLogbookUserIds(message, userIds);
                filteredMembers.forEach((m) => membersNeedingApples.push(m));
            }
        });
    };

    const removeRollCallRole = async (member) => {
        // roll call role removed from students given a '🍏'
        const hasRollCallRole = member.roles.cache.has(rollCallRoleId);
        const hasGreenAppleRole = member.roles.cache.has(greenAppleRoleId) || usersWithGreenAppleAdded.has(member.id);
        if (hasRollCallRole && hasGreenAppleRole) {
            await member.roles.remove([rollCallRoleId]);
            usersWithRollCallRemoved.add(member.id);
        }
    };

    const addActiveStudentRole = async (member) => {
        // active student role added to students given a '🍎'
        const hasActiveStudentRole = member.roles.cache.has(activeStudentRoleId);
        const hasRedAppleRole = member.roles.cache.has(redAppleRoleId) || usersWithRedAppleAdded.has(member.id);
        if (!hasActiveStudentRole && hasRedAppleRole) {
            await member.roles.add([activeStudentRoleId]);
            usersWithActiveStudentAdded.add(member.id);
        }
    };

    const addAppleRoles = async () => {
        const bothRoles = [greenAppleRoleId, redAppleRoleId];
        if (logbookUserIds.length === 0 || membersNeedingApples.length === 0) {
            return;
        }

        const userFrequency = {};
        for (let i = 0; i < logbookUserIds.length; i++) {
            userFrequency[logbookUserIds[i]] = userFrequency[logbookUserIds[i]] ? userFrequency[logbookUserIds[i]] + 1 : 1;
        }

        await Promise.all(membersNeedingApples.map(async (member) => {
            if(member.roles.cache.has(redAppleRoleId) && member.roles.cache.has(greenAppleRoleId)) {
                usersWithNoApplesAdded.add(member.id);
            } else if (userFrequency[member.id] >= 2) {
                await member.roles.add(bothRoles);
                usersWithGreenAppleAdded.add(member.id);
                usersWithRedAppleAdded.add(member.id);
            } else if (!member.roles.cache.has(greenAppleRoleId)) {
                await member.roles.add([greenAppleRoleId]);
                usersWithGreenAppleAdded.add(member.id);
            } else {
                await member.roles.add([redAppleRoleId]);
                usersWithRedAppleAdded.add(member.id);
            }
            await removeRollCallRole(member);
            await addActiveStudentRole(member);
        }));
    };

    const addOnlyRedAppleRole = async () => {
        if (membersNeedingOnlyRedApples.size === 0) {
            return;
        }
        const members = Array.from(membersNeedingOnlyRedApples.values());
        await Promise.all(members.map(async (member) => {
            // must run after addAppleRoles to ensure cache has been updated
            if (!member.roles.cache.has(redAppleRoleId)) {
                await member.roles.add([redAppleRoleId]);
                usersWithRedAppleAdded.add(member.id);
            }
            await removeRollCallRole(member);
            await addActiveStudentRole(member);
        }));
    };


    // get channel to log results
    const resultsChannel = client.channels.cache.get(logChannelId);
    if (!resultsChannel) {
        console.log(`Scheduled Job: giveApples - No results channel with id ${logChannelId} found to send updates to.`);
        return;
    }

    // get guild to apply apple roles
    if (!guildWithApples) {
        console.log(`Scheduled Job: giveApples - No guild was found for guildId ${guildId}.`);
        return sendErrorEmbed(resultsChannel, `No guild was found for guildId ${guildId}. 🙁`);
    }

    // gather all logbook channels from every guild running BangPD
    const logbookChannels = getAllLogbookChannels().filter(e => e);
    if (logbookChannels && logbookChannels.size === 0) {
        console.log('Scheduled Job: giveApples - No logbook channels found.');
        if (resultsChannel) {
            return sendErrorEmbed(resultsChannel, 'No logbook channels were found. 🙁');
        }
    }

    if (resultsChannel) {
        const description = 'I\'ve started checking yesterday\'s logbooks. Apples will be awarded shortly.';
        const fields = [
            { name: 'From', value: `${messagesSinceDateTime.toLocaleString(DateTime.DATETIME_FULL)}`, inline: true },
            { name: 'Until', value: `${currentDateTimeCT.toLocaleString(DateTime.DATETIME_FULL)}`, inline: true }
        ];
        await sendGiveApplesEmbed(resultsChannel, '🏁 Started!', description, fields);
    }

    // gather all the students from all logbook messages and set their roles
    await Promise.all(logbookChannels.map(async channel => {
        await sendLogEmbed(resultsChannel, `Checking yesterday's logbooks in ${channel}`, channel.guild.iconURL());
        await setApplesToGive(channel);
    }));

    // handle messages without an exclusion reaction
    await addAppleRoles();

    // handle messages with red apple only reaction
    await addOnlyRedAppleRole();

    // log students who had green apple role added
    const greenAppleRole = guildWithApples.roles.cache.get(greenAppleRoleId) || '🍏';
    if (resultsChannel && usersWithGreenAppleAdded.size > 0) {
        await sendRolesChanged(resultsChannel, usersWithGreenAppleAdded, '🍏', 'greenApple');
    } else {
        await sendLogEmbed(resultsChannel, `No students were given the ${greenAppleRole} role.`);
    }

    // log students who had red apple role added
    const redAppleRole = guildWithApples.roles.cache.get(redAppleRoleId) || '🍎';
    if (resultsChannel && usersWithRedAppleAdded.size > 0) {
        await sendRolesChanged(resultsChannel, usersWithRedAppleAdded, '🍎', 'redApple');
    } else {
        await sendLogEmbed(resultsChannel, `No students were given the ${redAppleRole} role.`);
    }

    //log students who had no apples added
    if (resultsChannel && usersWithNoApplesAdded.size > 0) {
        await sendRolesChanged(resultsChannel, usersWithNoApplesAdded, '➖ no new Apple', 'noNewApples');
    }

    // log students who had roll call role removed
    const rollCallRole = guildWithApples.roles.cache.get(rollCallRoleId) || '🔔 Roll Call';
    if (resultsChannel && usersWithRollCallRemoved.size > 0) {
        await sendRolesChanged(resultsChannel, usersWithRollCallRemoved, '🔔 Roll Call', 'rollCall');
    } else {
        await sendLogEmbed(resultsChannel, `No students had the ${rollCallRole} role removed.`);
    }

    // log students who had active student role added
    const activeStudentRole = guildWithApples.roles.cache.get(activeStudentRoleId) || 'Active Student';
    if (resultsChannel && usersWithActiveStudentAdded.size > 0) {
        await sendRolesChanged(resultsChannel, usersWithActiveStudentAdded, 'Active Student', 'activeStudent');
    } else {
        await sendLogEmbed(resultsChannel, `No students were given the ${activeStudentRole} role.`);
    }

    // mark checked logbooks as completed
    if (messagesWithApplesApplied.length > 0) {
        await sendLogEmbed(resultsChannel, 'Marking checked logbooks as completed. 👍');
        await Promise.all(messagesWithApplesApplied.map(async (msg) => {
            await msg.react('👍');
        }));
    }

    // well done bang pd nim!
    const jobEndDateTime = DateTime.utc().setZone('America/Chicago');
    const totalTimeElapsedInMs = jobEndDateTime.diff(currentDateTimeCT);
    const formattedRuntime = Duration.fromObject({ milliseconds: totalTimeElapsedInMs }).toFormat('hh:mm:ss');
    const formattedRolesApplied = `${greenAppleRole} added: ${usersWithGreenAppleAdded.size}` + '\n' +
        `${redAppleRole} added: ${usersWithRedAppleAdded.size}` + '\n' +
        `${rollCallRole} removed: ${usersWithRollCallRemoved.size}` + '\n' +
        `${activeStudentRole} added: ${usersWithActiveStudentAdded.size}` + '\n';

    const completedDescription = 'All logbooks have been checked. See you next time!';
    const fields = [
        { name: 'Total Runtime', value: `${formattedRuntime}` },
        { name: 'Roles Applied', value: `${formattedRolesApplied}` }
    ];
    await sendGiveApplesEmbed(resultsChannel, '🎉 Completed!', completedDescription, fields);
};

module.exports = {
    name: 'giveApples',
    async start(client, schedule, serverId) {
        if (CURRENT_APPLE_TASK) {
            CURRENT_APPLE_TASK.stop();
        }

        let guilds = [];
        let environment = 'BA';
        let jobSchedule = '';

        if (serverId === 'dev') {
            environment = 'dev';
            const { cronSchedule } = appleConfig['dev'];
            jobSchedule = schedule ? schedule : cronSchedule;
        } else {
            guilds = ALL_GUILD_IDS.includes(serverId) ? [serverId] : ALL_GUILD_IDS;
            const { cronSchedule } = appleConfig['BA'];
            jobSchedule = schedule ? schedule : cronSchedule;

        }

        CURRENT_APPLE_TASK = cron.schedule(
            jobSchedule,
            () => {
                runGiveApplesJob(client, environment, guilds);
            }, {
                scheduled: true,
                timezone: 'America/Chicago'
            });
    },
    async stop() {
        if (CURRENT_APPLE_TASK) {
            CURRENT_APPLE_TASK.stop();
        }
    },
    async run(client, serverId) {
        let guilds = [];
        let environment = 'BA';

        if (serverId === 'dev') {
            environment = 'dev';
        } else {
            guilds = ALL_GUILD_IDS.includes(serverId) ? [serverId] : ALL_GUILD_IDS;
        }

        await runGiveApplesJob(client, environment, guilds);
    }
};