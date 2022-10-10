const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageAttachment } = require('discord.js');
const Promise = require('promise');

const ALL_GUILD_IDS = DiscordUtil.getGuildIdsWithoutBAE();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kickrollcall')
        .setDescription('Gets all users with the ROLLCALL role and kicks them from all servers.')
        .setDefaultPermission(false),
    async execute(interaction) {
        const rollcallTagId = '763929191715831860';
        const interactionId = interaction.id;
        const msgLimit = 2000;

        await interaction.deferReply({ ephemeral: true });

        const guilds = DiscordUtil.getAllGuilds(ALL_GUILD_IDS, interaction);
        const errorUsersPerServer = {
            guildId: '',
            BATId: '',
            BALId: '',
            BAGId: '',
            BADId: '',
            BAEId: ''
        };

        const getUsersWithRollCall = () => {
            const ids = Array.from(guilds[0].roles.cache.get(rollcallTagId).members.keys());
            return [ids, ids.map(id => `<@${id}>`).join(' ')];
        };

        const splitMessages = () => {
            const mentionMessages = [];
            while (mentions.length !== 0) {
                const end = mentions.substring(0, msgLimit).lastIndexOf('>');
                mentionMessages.push(mentions.substring(0, end + 1));
                mentions = mentions.substring(end + 1, mentions.length);
            }
            mentionMessages.forEach(msg => interaction.followUp({ content: msg, ephemeral: true }));
        };

        const kickUsersOnServers = async () => {
            let membersKicked = '';
            await Promise.all(userIds.map(async (id) => {
                let errorCount = 0;
                await Promise.all(guilds.map(async (guild) => {
                    await guild.members.kick(id)
                        .catch((error) => {
                            console.log(error);
                            errorCount += 1;
                            errorUsersPerServer[guild.id] += `<@${id}>\n`;
                        });
                }));
                if (errorCount !== guilds.length) {
                    membersKicked += `<@${id}>\n`;
                }
            }));
            return membersKicked;
        };

        const confirmButton = new MessageButton()
            .setCustomId(`confirmKick_${interactionId}`)
            .setLabel('Kick')
            .setStyle('DANGER');
        const cancelButton = new MessageButton()
            .setCustomId(`cancelKick_${interactionId}`)
            .setLabel('Cancel')
            .setStyle('SECONDARY');
        const actionRow = new MessageActionRow().addComponents(cancelButton, confirmButton);

        let [userIds, mentions] = getUsersWithRollCall();
        if (userIds.length > 0) {
            await interaction.followUp({ content: 'Are you sure you want to kick these users from all BA servers?', components: [actionRow], ephemeral: true });
            splitMessages();

            const filter = (buttonInteraction) => {
                return interaction.user.id === buttonInteraction.user.id;
            };
            const collector = interaction.channel.createMessageComponentCollector({
                filter
            });
            collector.on('collect', async (click) => {
                if (click.customId === `confirmKick_${interactionId}`) {
                    collector.stop();
                    await interaction.editReply({ content: 'Kick confirmed', components: [], ephemeral: true });

                    const membersKicked = await kickUsersOnServers();
                    const attachment = new MessageAttachment(Buffer.from(membersKicked, 'utf-8'), 'usersID.txt');
                    await interaction.followUp({ content: 'These ROLLCALL users were kicked from at least one server', files: [attachment], ephemeral: true });

                    Object.entries(errorUsersPerServer).forEach(([key, value]) => {
                        if (value !== '') {
                            const errorAttachment = new MessageAttachment(Buffer.from(value, 'utf-8'), 'usersID.txt');
                            return interaction.followUp({ content: `There was an error kicking these users from server with ID ${key} <a:shookysad:949689086665437184>`, files: [errorAttachment], ephemeral: true });
                        }
                    });
                } else if (click.customId === `cancelKick_${interactionId}`) {
                    collector.stop();
                    return interaction.editReply({ content: 'Kick canceled', components: [], ephemeral: true });
                }
            });
        } else {
            return interaction.followUp({ content: 'There are no users with ROLLCALL tag', ephemeral: true });
        }
    }
};