const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId, BATId, BALId, BAGId, BADId } = require('../../config.json');
const { ChannelType } = require('discord-api-types/v9');
const { MessageAttachment } = require('discord.js');

const ALL_GUILD_IDS = [guildId, BATId, BALId, BAGId, BADId];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unbanuseridinmessage')
        .setDescription('Gets a list of user ids from a message(s) and unbans them from all servers.')
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

        await interaction.deferReply();

        const unbanUsersOnServers = async (messageId) => {
            channel.messages.fetch(messageId).then(async (msg) => {
                let membersUnbanned = '';
                const userIds = msg.content.split(' ');
                for (const id of userIds) {
                    let errorCount = 0;
                    for (const idGuild of ALL_GUILD_IDS) {
                        const guild = interaction.client.guilds.cache.get(idGuild);
                        if (idGuild && !guild) {
                            return interaction.followUp({ content: `I can't find server with ID ${idGuild} <a:shookysad:949689086665437184>` });
                        }
                        await guild.members.unban(id)
                            .catch((error) => {
                                console.log(error);
                                errorCount += 1;
                                interaction.followUp({ content: `There was an error unbanning user <@${id}> in server with ID ${idGuild} <a:shookysad:949689086665437184>` });
                            });
                    }
                    if (errorCount !== ALL_GUILD_IDS.length) {
                        membersUnbanned += `<@${id}>\n`;
                    }
                }
                const attachment = new MessageAttachment(Buffer.from(membersUnbanned, 'utf-8'), 'usersID.txt');
                interaction.followUp({ content: `Users in message ${messageId} were unbanned`, files: [attachment] });
            }).catch((error) => {
                console.log(error);
                interaction.followUp({ content: `There was an error checking ${messageId} in channel <#${channel.id}> <a:shookysad:949689086665437184>` });
            });
        };

        const allMessageIds = messageIds.split(' ');
        for (const messageId of allMessageIds) { await unbanUsersOnServers(messageId); }
    }
};