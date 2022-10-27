const DiscordUtil = require('../../common/discordutil.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const ALL_GUILD_IDS = DiscordUtil.getGuildIdsWithoutBAE();

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('kick user')
        .setType(2)
        .setDefaultPermission(false),
    async execute(interaction) {
        const user = interaction.targetUser;
        const interactionId = interaction.id;

        const guilds = DiscordUtil.getAllGuilds(ALL_GUILD_IDS, interaction);

        const confirmButton = new MessageButton()
            .setCustomId(`confirmKick_${interactionId}`)
            .setLabel('Kick')
            .setStyle('DANGER');
        const cancelButton = new MessageButton()
            .setCustomId(`cancelKick_${interactionId}`)
            .setLabel('Cancel')
            .setStyle('SECONDARY');
        const actionRow = new MessageActionRow().addComponents(cancelButton, confirmButton);

        await interaction.reply({ content: `Are you sure you want to kick user ${user} from all BA servers?`, components: [actionRow], ephemeral: true });

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
                const [membersKicked, errorUsersPerServer] = await DiscordUtil.kickUsersOnServers([user.id], guilds);
                let errorGuilds = '';
                Object.entries(errorUsersPerServer).forEach(([key, value]) => {
                    if (value !== '') {
                        errorGuilds += `${key},`;
                    }
                });
                if (errorGuilds === '') {
                    return interaction.followUp({ content: `User ${user} has been kicked`, ephemeral: true });
                } else {
                    errorGuilds = errorGuilds.slice(0, -1);
                    return interaction.followUp({ content: `User ${user} could not be kicked from servers with IDs ${errorGuilds}`, ephemeral: true });
                }
            } else if (click.customId === `cancelKick_${interactionId}`) {
                collector.stop();
                return interaction.editReply({ content: 'Kick canceled', components: [], ephemeral: true });
            }
        });
    }
};