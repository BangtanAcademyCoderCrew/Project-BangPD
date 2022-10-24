const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

const ALL_GUILD_IDS = DiscordUtil.getGuildIdsWithoutBAE();
const LEAVE_BUTTON_ID = 'leaveAllServers';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaveserversmessage')
        .setDescription('Replies with a permanent message with a button to leave all servers.')
        .setDefaultPermission(false),
    async execute(interaction) {
        const leaveEmbed = new MessageEmbed()
            .setColor('#b00000')
            .setTitle('In case you wish to leave Bangtan Academy press the "Leave" button below.')
            .setDescription('This means you will leave Bangtan Academy and all it\'s servers.');
        const leaveButton = new MessageButton()
            .setCustomId(LEAVE_BUTTON_ID)
            .setLabel('Leave')
            .setStyle('PRIMARY');
        const actionRow = new MessageActionRow().addComponents(leaveButton);

        return interaction.reply({ embeds: [leaveEmbed], components: [actionRow] });
    },
    isLeaveServersButton(buttonId, userId) {
        return buttonId === LEAVE_BUTTON_ID || buttonId === `confirmLeave_${userId}`;
    },
    async handleLeaveInteraction(interaction) {
        if (interaction.customId === LEAVE_BUTTON_ID) {
            const confirmationEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle('❗ Are you sure you want to leave Bangtan Academy? ❗')
                .setDescription('This means you will leave Bangtan Academy and all it\'s servers.');
            const confirmButton = new MessageButton()
                .setCustomId(`confirmLeave_${interaction.user.id}`)
                .setLabel('Confirm')
                .setStyle('DANGER');
            const confirmRow = new MessageActionRow().addComponents(confirmButton);
            return interaction.reply({ embeds: [confirmationEmbed], components: [confirmRow], ephemeral: true });
        }
        if (interaction.customId === `confirmLeave_${interaction.user.id}`) {
            await interaction.deferReply({ ephemeral: true });
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
                return interaction.followUp({ content: 'You have left', ephemeral: true });
            } else {
                errorGuilds = errorGuilds.slice(0, -1);
                return interaction.followUp({ content: 'There was an error while leaving from some of the servers.', ephemeral: true });
            }
        }
    }
};

