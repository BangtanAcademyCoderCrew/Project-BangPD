const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { guildId, BATId, BALId, BAGId, BADId } = require('../../config.json');

const ALL_GUILD_IDS = [guildId, BATId, BALId, BAGId, BADId];

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('kick user')
        .setType(2)
        .setDefaultPermission(false),
    async execute(interaction) {
        const userId = interaction.targetUser.id;
        let errorCount = 0;

        await interaction.deferReply();

        const kickAcrossServers = async (idGuild) => {
            const guild = interaction.client.guilds.cache.get(idGuild);
            if (idGuild && !guild) {
                return interaction.followUp({ content: `I can't find server with ID ${idGuild} <a:shookysad:949689086665437184>` });
            }
            await guild.members.kick(userId)
                .catch((error) => {
                    console.log(error);
                    errorCount += 1;
                    return interaction.followUp({ content: `There was an error kicking user <@${userId}> in server with ID ${idGuild} <a:shookysad:949689086665437184>` });
                });
        };

        for (const idGuild of ALL_GUILD_IDS) { await kickAcrossServers(idGuild); }

        if (errorCount !== ALL_GUILD_IDS.length) {
            return interaction.followUp({ content: `User <@${userId}> has been kicked`, ephemeral: true });
        } else {
            return interaction.followUp({ content: `User <@${userId}> could not be kicked from any of the servers`, ephemeral: true });
        }
    }
};