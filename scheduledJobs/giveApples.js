const cron = require('node-cron');
const Promise = require('promise');
const { fetchAllMessagesByChannelSince, batchItems, sendAppleEmbed } = require('../common/discordutil');
const { DateTime } = require('luxon');
const { MessageAttachment } = require('discord.js');
const { guildId } = require('../config.json');

// For Testing in BA Code
const greenAppleRoleId = '964598327775744070';
const redAppleRoleId = '964597638047612969';
const rollCallRoleId = '841115841852080129';
// apple-log channel
const resultsChannelId = '1033147239343861760';
// every 5 min
const cronSchedule = '*/5 * * * *';

// For Release in BA
// const greenAppleRoleId = '875740793078431825';
// const redAppleRoleId = '875740253980336158';
// const rollCallRoleId = '763929191715831860';
// const resultsChannelId = '876672628692250654';
// nightly at 2am
// const cronSchedule = '0 2 * * *';

const ignoreReactionName = 'yoongerine';
const logbookChannelNameStem = 'class-n-club-logbook';
const appleEmbedTitleBase = 'GiveTheApples';
const batchSize = 100;

module.exports = {
    name: 'giveApples',
    async start(client) {
        // running job at 02:00 at America/Chicago timezone
        cron.schedule(cronSchedule, async () => {
            const cst = 'America/Chicago';
            const currentDateTimeCT = DateTime.utc().setZone(cst);
            const messagesSinceDateTime = currentDateTimeCT.minus({ days: 1 });

            const messagesWithApplesApplied = [];
            let logbookUserIds = [];
            const membersNeedingApples = new Set();
            const membersNeedingGreenApples = new Set();
            let usersWithGreenApple = '';
            let usersWithRedApple = '';

            const addAppleRoles = async () => {
                const bothRoles = [greenAppleRoleId, redAppleRoleId];
                if (logbookUserIds.length === 0 || membersNeedingApples.size === 0) {
                    return;
                }

                const userFrequency = {};
                for (let i = 0; i < logbookUserIds.length; i++) {
                    userFrequency[logbookUserIds[i]] = userFrequency[logbookUserIds[i]] ? userFrequency[logbookUserIds[i]] + 1 : 1;
                }

                const members = Array.from(membersNeedingApples.values());
                await Promise.all(members.map(async (member) => {
                    if (userFrequency[member.id] >= 2 && usersWithGreenApple.indexOf(member.id) === -1) {
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
                if (membersNeedingGreenApples.size === 0) {
                    return;
                }
                const members = Array.from(membersNeedingGreenApples.values());
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
                    const hasAlreadyBeenChecked = m.reactions.cache.has('👍') && m.reactions.cache.get('👍').me;

                    // i.e. kckc class
                    const ignoreMessageReaction = m.reactions.cache.find(r => r.emoji.name.includes(ignoreReactionName));
                    const isMarkedToIgnore = ignoreMessageReaction !== undefined;

                    const messageContent = m.content.replace(/\D/g, ' ').split(' ');
                    const userIds = messageContent.filter(e => e.length >= 16);

                    return !hasAlreadyBeenChecked && !isMarkedToIgnore && userIds.length > 0;
                });
            };

            const setLogbookUserIds = (message, userIds) => {
                const usersInMessage = Array.from(message.client.users.cache.filter(u => userIds.includes(u.id)).values());
                const messageUserIds = usersInMessage.map(user => user.id);
                logbookUserIds = logbookUserIds.concat(messageUserIds);
                if (messageUserIds.length > 0) {
                    messagesWithApplesApplied.push(message);
                }
            };

            const setGiveTheApples = async (channel) => {
                const guild = await client.guilds.cache.get(guildId);
                if (!guild) {
                    await sendErrorEmbed(`No guild was found for guildId ${guildId}. 🙁`);
                    return;
                }

                const messages = await fetchAllMessagesByChannelSince(channel, messagesSinceDateTime);
                if (messages.size === 0) {
                    await sendLogEmbed(`No logbooks were found in channel ${channel.id} yesterday. Continuing...`);
                    return;
                }

                const filteredMessages = await filterOnlyValidMessages(messages);
                if (filteredMessages.size === 0) {
                    await sendLogEmbed(`No unchecked logbooks were found in channel ${channel.id} yesterday. Continuing...`);
                    return;
                }

                Promise.all(filteredMessages.map(async message => {
                    const messageContent = message.content.replace(/\D/g, ' ').split(' ');
                    const userIds = messageContent.filter(e => e.length >= 16);
                    const filteredMembers = Array.from(guild.members.cache.filter(member => userIds.includes(member.id)).values());
                    const hasGreenAppleReaction = message.reactions.cache.has('🍏');
                    if (hasGreenAppleReaction) {
                        // i.e. homework helper logbook
                        if (filteredMembers.length > 0) {
                            messagesWithApplesApplied.push(message);
                        }
                        filteredMembers.forEach((m) => membersNeedingGreenApples.add(m));
                    } else {
                        // i.e. homework logbook
                        setLogbookUserIds(message, userIds);
                        filteredMembers.forEach((m) => membersNeedingApples.add(m));
                    }
                }));
            };

            const sendCompletedEmbed = async (description) => {
                const title = `${appleEmbedTitleBase} - Completed! 🎉`;
                await sendAppleEmbed(resultsChannel, title, description);
            };

            const sendErrorEmbed = async (description) => {
                const title = `${appleEmbedTitleBase} - Error!`;
                await sendAppleEmbed(resultsChannel, title, description);
            };

            const sendLogEmbed = async (description) => {
                const title = `${appleEmbedTitleBase}`;
                await sendAppleEmbed(resultsChannel, title, description);
            };

            // gather all logbook channels from every guild running BangPD
            const clientChannels = client.channels.cache;
            const logbookChannels = clientChannels.filter((c) => c.name.toLowerCase().includes(logbookChannelNameStem));

            const resultsChannel = client.channels.cache.get(resultsChannelId);
            if (!resultsChannel) {
                console.log(`Scheduled Job: giveTheApples - no job dump channel with id ${resultsChannelId} found <a:shookysad:949689086665437184>`);
            }

            if (logbookChannels && logbookChannels.size === 0) {
                console.log('Scheduled Job: giveTheApples - no logbook channels found <a:shookysad:949689086665437184>');
                if (resultsChannel) {
                    return sendErrorEmbed('No logbook channels were found. 🙁');
                }
            }

            if (logbookChannels && logbookChannels.size > 0) {
                if (resultsChannel) {
                    const title = `${appleEmbedTitleBase} - Started! 🏁`;
                    const description = 'I\'m currently checking in with Manager Sejin. Apples will be awarded shortly.';
                    const fields = [
                        { name: 'From', value: `${messagesSinceDateTime.toLocaleString(DateTime.DATETIME_FULL)}`, inline: true },
                        { name: 'Until', value: `${currentDateTimeCT.toLocaleString(DateTime.DATETIME_FULL)}`, inline: true }
                    ];
                    await sendAppleEmbed(resultsChannel, title, description, fields);
                }

                await Promise.all(logbookChannels.map(async channel => {
                    await setGiveTheApples(channel);
                }));

                await addAppleRoles();

                // assign red apples, remove roll call and send update
                if (usersWithRedApple.length > 0) {
                    const allRedApples = usersWithRedApple.split(/\r?\n/);
                    const redBatches = batchItems(allRedApples, batchSize);
                    await Promise.all(redBatches.map(async (batch) => {
                        const index = redBatches.indexOf(batch);
                        const title = `${appleEmbedTitleBase} - Red Apples Assigned! 🍎 ${index + 1} of ${redBatches.length}!`;
                        if (resultsChannel && index === redBatches.length - 1) {
                            const attachmentRedApple = new MessageAttachment(Buffer.from(usersWithRedApple, 'utf-8'), 'usersID-redApple.txt');
                            await sendAppleEmbed(resultsChannel, title, batch.join(' '), [], [attachmentRedApple]);
                        } else if (resultsChannel) {
                            await sendAppleEmbed(resultsChannel, title, batch.join(' '));
                        }
                    }));
                } else {
                    await sendLogEmbed('No students needing a red apple. 🍎 Continuing...');
                }

                await addGreenAppleRole();

                // assign green apples, remove roll call and send update
                if (usersWithGreenApple.length > 0) {
                    const allGreenApples = usersWithGreenApple.split(/\r?\n/);
                    const greenBatches = batchItems(allGreenApples, batchSize);
                    await Promise.all(greenBatches.map(async (batch) => {
                        const index = greenBatches.indexOf(batch);
                        const title = `${appleEmbedTitleBase} - Green Apples Assigned! 🍏 ${index + 1} of ${greenBatches.length}!`;
                        if (resultsChannel && index === greenBatches.length - 1) {
                            const attachmentGreenApple = new MessageAttachment(Buffer.from(usersWithGreenApple, 'utf-8'), 'usersID-greenApple.txt');
                            await sendAppleEmbed(resultsChannel, title, batch.join(' '), [], [attachmentGreenApple]);
                        } else if (resultsChannel) {
                            await sendAppleEmbed(resultsChannel, title, batch.join(' '));
                        }
                    }));
                } else {
                    await sendLogEmbed('No students needing a green apple. 🍏 Continuing...');
                }

                // mark logbooks as completed
                if (messagesWithApplesApplied.length > 0) {
                    await sendLogEmbed('Marking logbooks as completed. 👍');
                    await Promise.all(messagesWithApplesApplied.map(async (msg) => {
                        await msg.react('👍');
                    }));
                }

                // well done bang pd nim!
                if (resultsChannel) {
                    await sendCompletedEmbed('All students from yesterday\'s logbooks have been awarded their apples. See you tomorrow! ');
                }
            }
        }, {
            scheduled: true,
            timezone: 'America/Chicago'
        });
    }
};