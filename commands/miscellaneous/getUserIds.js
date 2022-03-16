const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getuserids')
        .setDescription('Gets a list of user ids that were mentioned in a message')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The message id you would like to get the user ids from')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel this message is in')
                .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options;
        const messageId = options.getString('message_id');
        const channel = options.getChannel('channel');

        await interaction.deferReply();

        channel.messages.fetch(messageId).then((msg) => {
            const ids = msg.mentions.users.map(user => user.id);
            const attachment = new Discord.MessageAttachment(Buffer.from(`<@${ids.join('>\n<@')}>`, 'utf-8'), 'usersID.txt');
            interaction.reply({ content: `Users in message ${messageId}`, files: [attachment] });
        }).catch((error) => {
            console.log(error);
            interaction.reply({ content: `Message with ID ${messageId} wasn't found in channel <#${channel.id}> <:shookysad:949689086665437184>` });
        });
    }
};
