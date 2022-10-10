const DiscordUtil = require('../../common/discordutil.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Promise = require('promise');

const ALL_GUILD_IDS = DiscordUtil.getGuildIdsWithoutBAE();

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('kick user')
        .setType(2)
        .setDefaultPermission(false),
    async execute(interaction) {
        const user = interaction.targetUser;
        const interactionId = interaction.id;
        let errorCount = 0;

        const kickAcrossServers = async (idGuild) => {
            const guild = interaction.client.guilds.cache.get(idGuild);
            if (idGuild && !guild) {
                return interaction.followUp({ content: `I can't find server with ID ${idGuild} <a:shookysad:949689086665437184>`, ephemeral: true });
            }
            await guild.members.kick(user)
                .catch((error) => {
                    console.log(error);
                    errorCount += 1;
                    return interaction.followUp({ content: `There was an error kicking user ${user} in server ${guild.name} <a:shookysad:949689086665437184>`, ephemeral: true });
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
                await Promise.all(ALL_GUILD_IDS.map(async (idGuild) => {
                    await kickAcrossServers(idGuild);
                }));
                if (errorCount !== ALL_GUILD_IDS.length) {
                    return interaction.followUp({ content: `User ${user} has been kicked`, ephemeral: true });
                } else {
                    return interaction.followUp({ content: `User ${user} could not be kicked from any of the servers`, ephemeral: true });
                }
            } else if (click.customId === `cancelKick_${interactionId}`) {
                collector.stop();
                return interaction.editReply({ content: 'Kick canceled', components: [], ephemeral: true });
            }
        });
    }
};