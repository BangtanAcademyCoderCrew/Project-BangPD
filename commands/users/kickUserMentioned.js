const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const { MessageAttachment, MessageButton, MessageActionRow } = require('discord.js');
const Promise = require('promise');

const ALL_GUILD_IDS = DiscordUtil.getGuildIdsWithoutBAE();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kickuserinmessage')
        .setDescription('Gets a list of user ids mentioned in a message(s) and kicks them from all servers.')
        .addStringOption(option =>
            option.setName('message_ids')
                .setDescription('The message id(s) you would like to get the user ids from')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel the message(s) are in')
                .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
                .setRequired(true))
        .setDefaultPermission(false),
    async execute(interaction) {
        const options = interaction.options;
        const messageIds = options.getString('message_ids');
        const channel = options.getChannel('channel');
        const interactionId = interaction.id;

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

        const kickUsersOnServers = async (messageId) => {
            channel.messages.fetch(messageId).then(async (msg) => {
                let membersKicked = '';
                const userIds = msg.mentions.users.map(user => user.id);
                for (const id of userIds) {
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
                }
                const attachment = new MessageAttachment(Buffer.from(membersKicked, 'utf-8'), 'usersID.txt');
                interaction.followUp({ content: `These users in message ${messageId} were kicked from at least one server`, files: [attachment], ephemeral: true });
            }).catch((error) => {
                console.log(error);
                interaction.followUp({ content: `There was an error checking ${messageId} in channel <#${channel.id}> <a:shookysad:949689086665437184>`, ephemeral: true });
            });
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
        await interaction.followUp({ content: 'Are you sure you want to kick these users from all BA servers?', components: [actionRow], ephemeral: true });

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

                const allMessageIds = messageIds.split(' ');
                for (const messageId of allMessageIds) {
                    await kickUsersOnServers(messageId);
                    Object.entries(errorUsersPerServer).forEach(([key, value]) => {
                        if (value !== '') {
                            const errorAttachment = new MessageAttachment(Buffer.from(value, 'utf-8'), 'usersID.txt');
                            return interaction.followUp({ content: `There was an error kicking these users from server with ID ${key} <a:shookysad:949689086665437184>`, files: [errorAttachment], ephemeral: true });
                        }
                    });
                }
            } else if (click.customId === `cancelKick_${interactionId}`) {
                collector.stop();
                return interaction.editReply({ content: 'Kick canceled', components: [], ephemeral: true });
            }
        });
    }
};