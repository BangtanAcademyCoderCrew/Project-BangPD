const cron = require('node-cron');
const Promise = require('promise');
const { fetchAllMessagesByChannelSince, batchItems } = require('../common/discordutil');
const { DateTime } = require('luxon');
const { EmbedBuilder, MessageAttachment } = require('discord.js');
const { guildId } = require('../config.json');

const greenAppleRoleId = '875740793078431825';
const redAppleRoleId = '875740253980336158';
const rollCallRoleId = '763929191715831860';
const ignoreReactionName = 'yoongerine';
const greenAppleReactionName = 'green_apple';
const logbookChannelNameStem = 'class-n-club-logbook';
const jobDumpChannelId = '876672628692250654';

module.exports = {
    name: 'giveApples',
    async start(client) {
        // running job at 02:00 at America/Chicago timezone
        cron.schedule('0 2 * * *', async () => {
            const cst = 'America/Chicago';
            const currentDateTimeCT = DateTime.utc().setZone(cst);
            const messagesSinceDateTime = currentDateTimeCT.minus({ days: 1 });

            const messagesWithApplesApplied = [];
            let logbookUserIds = [];
            let membersNeedingApples = new Set();
            let membersNeedingGreenApples = new Set();
            let usersWithGreenApple = '';
            let usersWithRedApple = '';

            const addAppleRoles = async () => {
                const bothRoles = [greenAppleRoleId, redAppleRoleId];

                const userFrequency = {};
                for (let i = 0; i < logbookUserIds.length; i++) {
                    userFrequency[logbookUserIds[i]] = userFrequency[logbookUserIds[i]] ? userFrequency[logbookUserIds[i]] + 1 : 1;
                }

                const members = membersNeedingApples.values();
                await Promise.all(members.map(async (member) => {
                    if (userFrequency[member.id] >= 2) {
                        await member.roles.add(bothRoles);
                        usersWithGreenApple += `<@${member.id}>\n`;
                        usersWithRedApple += `<@${member.id}>\n`;
                    } else if (!member.roles.cache.has(greenAppleRoleId)) {
                        await member.roles.add([greenAppleRoleId]);
                        usersWithGreenApple += `<@${member.id}>\n`;
                    } else {
                        await member.roles.add([redAppleRoleId]);
                        usersWithRedApple += `<@${member.id}>\n`;
                    }
                    await removeRollCall(member);
                }));
            };

            const addGreenAppleRole = async () => {
                const members = membersNeedingGreenApples.values();
                await Promise.all(members.map(async (member) => {
                    // must run after addAppleRoles to ensure cache has been updated
                    if (!member.roles.cache.has(greenAppleRoleId)) {
                        await member.roles.add([greenAppleRoleId]);
                        usersWithGreenApple += `<@${member.id}>\n`;
                    }
                    await removeRollCall(member);
                }));
            };

            const removeRollCall = async (member) => {
                if (member.roles.cache.has(rollCallRoleId)) {
                    await member.roles.remove([rollCallRoleId]);
                }
            };

            const filterOnlyValidMessages = async (messages) => {
                return messages.filter(m => {
                    const hasAlreadyBeenChecked = m.reactions.cache.get('👍');
                    // i.e. kckc class
                    const isMarkedToIgnore = m.reactions.cache.find(r => r.name.includes(ignoreReactionName));
                    return !hasAlreadyBeenChecked && !isMarkedToIgnore;
                });
            };

            const setLogbookUserIds = (message) => {
                const messageContent = message.content.replace(/\D/g, ' ').split(' ');
                const userIds = messageContent.filter(e => e.length >= 16);
                const usersInMessage = message.client.users.cache.filter(u => userIds.includes(u.id));
                const messageUserIds = usersInMessage.map(user => user.id);
                logbookUserIds = logbookUserIds.concat(messageUserIds);

                if (messageUserIds.length > 0) {
                    messagesWithApplesApplied.push(message);
                }
            };

            const setGiveTheApples = async (channel) => {
                const messages = await fetchAllMessagesByChannelSince(channel, messagesSinceDateTime);
                const filteredMessages = filterOnlyValidMessages(messages);
                return filteredMessages.map(message => {
                    const hasGreenAppleReaction = message.reactions.cache.find(r => r.name.includes(greenAppleReactionName));
                    const guild = client.guilds.cache.get(guildId);
                    const messageUserIds = message.mentions.users.map(user => user.id);
                    const filteredMembers = guild.members.cache.filter(member => messageUserIds.includes(member.id));
                    if (hasGreenAppleReaction) {
                        // i.e. homework helper logbook
                        membersNeedingGreenApples = membersNeedingGreenApples.add(filteredMembers);
                    } else {
                        // i.e. homework logbook
                        setLogbookUserIds(message);
                        membersNeedingApples = membersNeedingApples.add(filteredMembers);
                    }
                });
            };

            // gather all logbook channels from every guild running BangPD
            const logbookChannels = client.channels.cache.filter((c) => c.name.toLowerCase().includes(logbookChannelNameStem)).toArray();
            const jobDumpChannel = client.channels.cache.get(jobDumpChannelId);
            if (!jobDumpChannel) {
                console.log(`Scheduled Job: giveTheApples - no job dump channel with id ${jobDumpChannelId} found <a:shookysad:949689086665437184>`);
            }

            const startedEmbed = new EmbedBuilder()
                .setColor('5445ff')
                .setTitle('GiveTheApples - Started!')
                .setDescription('I\'m currently checking in with Manager Sejin. Apples will be awarded shortly.')
                .addFields(
                    { name: 'Checking Logbooks From', value: `${messagesSinceDateTime.toLocaleString(DateTime.DATETIME_FULL)}`, inline: true },
                    { name: 'Until', value: `${currentDateTimeCT.toLocaleString(DateTime.DATETIME_FULL)}`, inline: true }
                );

            if (jobDumpChannel) {
                jobDumpChannel.send({ embeds: [startedEmbed] });
            }

            if (logbookChannels && logbookChannels.length === 0) {
                console.log('Scheduled Job: giveTheApples - no logbook channels found <a:shookysad:949689086665437184>');
                const completedNoLogDateTimeCT = DateTime.utc().setZone(cst);
                const completedNoLogEmbed = new EmbedBuilder()
                    .setColor('5445ff')
                    .setTitle('GiveTheApples - Completed!')
                    .setDescription('No logbook channels were found. Coder Crew assemble!')
                    .addFields(
                        { name: 'Completed at', value: `${completedNoLogDateTimeCT.toLocaleString(DateTime.DATETIME_FULL)}` }
                    );
                if (jobDumpChannel) {
                    jobDumpChannel.send({ embeds: [completedNoLogEmbed] });
                }
            }

            if (logbookChannels && logbookChannels.length > 0) {
                await Promise.all(logbookChannels.map(async channel => {
                    await setGiveTheApples(channel);
                }));

                const batchSize = 100;

                // assign red apples, remove roll call and send update
                await addAppleRoles();
                const allRedApples = usersWithRedApple.split(/\r?\n/);
                const redBatches = batchItems(allRedApples, batchSize);
                redBatches.forEach((chunk, index) => {
                    const redAppleEmbed = new EmbedBuilder()
                        .setColor('5445ff')
                        .setTitle(`GiveTheApples - Red Apples Assigned! ${index + 1} of ${redBatches.length}`)
                        .setDescription(chunk);
                    if (jobDumpChannel && index === redBatches.length - 1) {
                        const attachmentRedApple = new MessageAttachment(Buffer.from(usersWithRedApple, 'utf-8'), 'usersID-redApple.txt');
                        jobDumpChannel.send({ embeds: [redAppleEmbed], files: [attachmentRedApple] });
                    } else {
                        jobDumpChannel.send({ embeds: [redAppleEmbed] });
                    }
                });

                // assign green apples, remove roll call and send update
                await addGreenAppleRole();
                const allGreenApples = usersWithGreenApple.split(/\r?\n/);
                const greenBatches = batchItems(allGreenApples, batchSize);
                greenBatches.forEach((batch, index) => {
                    const greenAppleEmbed = new EmbedBuilder()
                        .setColor('5445ff')
                        .setTitle(`GiveTheApples - Green Apples Assigned! ${index + 1} of ${greenBatches.length}`)
                        .setDescription(batch);
                    if (jobDumpChannel && index === greenBatches.length - 1) {
                        const attachmentGreenApple = new MessageAttachment(Buffer.from(usersWithGreenApple, 'utf-8'), 'usersID-greenApple.txt');
                        jobDumpChannel.send({ embeds: [greenAppleEmbed], files: [attachmentGreenApple] });
                    } else {
                        jobDumpChannel.send({ embeds: [greenAppleEmbed] });
                    }
                });

                // mark logbooks as completed
                await Promise.all(messagesWithApplesApplied.map(async (msg) => {
                    await msg.react('👍');
                }));

                // well done bang pd nim, see you tomorrow!
                const completedDateTimeCT = DateTime.utc().setZone(cst);
                const completedEmbed = new EmbedBuilder()
                    .setColor('5445ff')
                    .setTitle('GiveTheApples - Completed!')
                    .setDescription('All students from yesterday\'s logbooks have been awarded their apples. See you tomorrow!')
                    .addFields(
                        { name: 'Completed at', value: `${completedDateTimeCT.toLocaleString(DateTime.DATETIME_FULL)}` }
                    );
                if (jobDumpChannel) {
                    jobDumpChannel.send({ embeds: [completedEmbed] });
                }
            }
        }, {
            scheduled: true,
            timezone: 'America/Chicago'
        });
    }
};