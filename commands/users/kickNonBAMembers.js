const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageAttachment } = require('discord.js');

const SATELLITE_GUILD_IDS = DiscordUtil.getSatelliteGuildIdsWithoutBAE();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kicknonbamembers')
        .setDescription('Gets all users that are members of satellite servers but not of the main BA server and kicks them.')
        .setDefaultPermission(false),
    async execute(interaction) {
        const interactionId = interaction.id;

        await interaction.deferReply({ ephemeral: true });

        const confirmButton = new MessageButton()
            .setCustomId(`confirmKick_${interactionId}`)
            .setLabel('Kick')
            .setStyle('DANGER');
        const cancelButton = new MessageButton()
            .setCustomId(`cancelKick_${interactionId}`)
            .setLabel('Cancel')
            .setStyle('SECONDARY');
        const actionRow = new MessageActionRow().addComponents(cancelButton, confirmButton);

        const satelliteGuilds = DiscordUtil.getAllGuilds(SATELLITE_GUILD_IDS, interaction);
        const [userIds, mentions] = DiscordUtil.getNonBAMembers(interaction);
        if (userIds.length > 0) {
            await interaction.followUp({ content: 'Are you sure you want to kick these users from all satellite servers?', components: [actionRow], ephemeral: true });
            DiscordUtil.splitMessages(mentions).forEach(msg => interaction.followUp({ content: msg, ephemeral: true }));

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

                    const [membersKicked, errorUsersPerServer] = await DiscordUtil.kickUsersOnServers(userIds, satelliteGuilds);
                    const attachment = new MessageAttachment(Buffer.from(membersKicked, 'utf-8'), 'usersID.txt');
                    await interaction.followUp({ content: 'These users were kicked from at least one server', files: [attachment], ephemeral: true });

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
            return interaction.followUp({ content: 'There are no users that are a member of a satellite server but not the main server.', ephemeral: true });
        }
    }
};