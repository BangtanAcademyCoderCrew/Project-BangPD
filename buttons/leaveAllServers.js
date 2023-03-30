const DiscordUtil = require('../common/discordutil.js');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

const ALL_GUILD_IDS = DiscordUtil.getGuildIdsWithoutBAE();
const LEAVE_BUTTON_ID = 'leaveAllServers';

module.exports = {
    name: LEAVE_BUTTON_ID,
    /**
     * Description example:
     * In case you wish to leave Bangtan Academy press the "Leave" button below. This means you will leave Bangtan Academy and all it's servers.
     * @param {ButtonInteraction} interaction
     * @param {GuildMember} member
     */
    async run(interaction, member) {
        await interaction.deferReply({ ephemeral: true });

        const confirmationEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('❗ Are you sure you want to leave Bangtan Academy? ❗')
            .setDescription('This means you will leave Bangtan Academy and all it\'s servers.');
        const confirmButton = new MessageButton()
            .setCustomId(`confirmLeave_${interaction.id}`)
            .setLabel('Confirm')
            .setStyle('DANGER');
        const cancelButton = new MessageButton()
            .setCustomId(`cancelLeave_${interaction.id}`)
            .setLabel('Cancel')
            .setStyle('PRIMARY');
        const confirmRow = new MessageActionRow().addComponents(cancelButton, confirmButton);
        await interaction.followUp({ embeds: [confirmationEmbed], components: [confirmRow], ephemeral: true });

        const filter = (buttonInteraction) => {
            return interaction.user.id === buttonInteraction.user.id;
        };
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 15000
        });
        collector.on('collect', async (click) => {
            if (click.customId === `confirmLeave_${interaction.id}`) {
                collector.stop();
                await interaction.followUp({ content: 'Leaving confirmed.', ephemeral: true });

                const guilds = DiscordUtil.getAllGuilds(ALL_GUILD_IDS, interaction);
                const [membersKicked, errorUsersPerServer] = await DiscordUtil.kickUsersOnServers([interaction.user.id], guilds);
                let errorGuilds = '';
                Object.entries(errorUsersPerServer).forEach(([key, value]) => {
                    if (value !== '') {
                        errorGuilds += `${key},`;
                    }
                });
                if (errorGuilds !== '') {
                    return interaction.followUp({ content: 'You have left Bangtan Academy.', ephemeral: true });
                } else {
                    errorGuilds = errorGuilds.slice(0, -1);
                    return interaction.followUp({ content: 'There was an error while leaving from some of the servers.', ephemeral: true });
                }
            } else if (click.customId === `cancelLeave_${interaction.id}`) {
                collector.stop();
            }
        });

        collector.on('end', () => {
            return interaction.followUp({ content: 'The command has been canceled. 😊', ephemeral: true });
        });
    }
};