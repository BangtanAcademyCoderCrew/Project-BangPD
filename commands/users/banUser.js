const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { guildId, BATId, BALId, BAGId, BADId } = require('../../config.json');

const ALL_GUILD_IDS = [guildId, BATId, BALId, BAGId, BADId];

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('ban user')
        .setType(2)
        .setDefaultPermission(false),
    async execute(interaction) {
        const userId = interaction.targetUser.id;
        let errorCount = 0;

        await interaction.deferReply();

        const banAcrossServers = async (idGuild) => {
            const guild = interaction.client.guilds.cache.get(idGuild);
            if (idGuild && !guild) {
                return interaction.followUp({ content: `I can't find server with ID ${idGuild} <a:shookysad:949689086665437184>` });
            }
            await guild.members.ban(userId)
                .catch((error) => {
                    console.log(error);
                    errorCount += 1;
                    return interaction.followUp({ content: `There was an error banning user <@${userId}> in server with ID ${idGuild} <a:shookysad:949689086665437184>` });
                });
        };

        for (const idGuild of ALL_GUILD_IDS) { await banAcrossServers(idGuild); }

        if (errorCount !== ALL_GUILD_IDS.length) {
            return interaction.followUp({ content: `User <@${userId}> has been banned`, ephemeral: true });
        } else {
            return interaction.followUp({ content: `User <@${userId}> could not be banned from any of the servers`, ephemeral: true });
        }
    }
};