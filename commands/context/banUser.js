const DiscordUtil = require('../../common/discordutil.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow } = require('discord.js');
const Promise = require('promise');

const ALL_GUILD_IDS = DiscordUtil.getAllGuildIds();

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('ban user')
        .setType(2)
        .setDefaultPermission(false),
    async execute(interaction) {
        const user = interaction.targetUser;
        const interactionId = interaction.id;
        let errorCount = 0;

        const banAcrossServers = async (idGuild) => {
            const guild = interaction.client.guilds.cache.get(idGuild);
            if (idGuild && !guild) {
                return interaction.followUp({ content: `I can't find server with ID ${idGuild} <a:shookysad:949689086665437184>`, ephemeral: true });
            }
            await guild.members.ban(user)
                .catch((error) => {
                    console.log(error);
                    errorCount += 1;
                    return interaction.followUp({ content: `There was an error banning user ${user} in server ${guild.name} <a:shookysad:949689086665437184>`, ephemeral: true });
                });
        };

        const confirmButton = new MessageButton()
            .setCustomId(`confirmBan_${interactionId}`)
            .setLabel('Ban')
            .setStyle('DANGER');
        const cancelButton = new MessageButton()
            .setCustomId(`cancelBan_${interactionId}`)
            .setLabel('Cancel')
            .setStyle('SECONDARY');
        const actionRow = new MessageActionRow().addComponents(cancelButton, confirmButton);

        await interaction.reply({ content: `Are you sure you want to ban user ${user} from all BA servers?`, components: [actionRow], ephemeral: true });

        const filter = (buttonInteraction) => {
            return interaction.user.id === buttonInteraction.user.id;
        };
        const collector = interaction.channel.createMessageComponentCollector({
            filter
        });
        collector.on('collect', async (click) => {
            if (click.customId === `confirmBan_${interactionId}`) {
                collector.stop();
                await interaction.editReply({ content: 'Ban confirmed', components: [], ephemeral: true });
                await Promise.all(ALL_GUILD_IDS.map(async (idGuild) => {
                    await banAcrossServers(idGuild);
                }));
                if (errorCount !== ALL_GUILD_IDS.length) {
                    return interaction.followUp({ content: `User ${user} has been banned`, ephemeral: true });
                } else {
                    return interaction.followUp({ content: `User ${user} could not be banned from any of the servers`, ephemeral: true });
                }
            } else if (click.customId === `cancelBan_${interactionId}`) {
                collector.stop();
                return interaction.editReply({ content: 'Ban canceled', components: [], ephemeral: true });
            }
        });
    }
};