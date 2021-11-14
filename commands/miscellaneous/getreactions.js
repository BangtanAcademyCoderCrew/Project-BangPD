const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

// TODO: needs permissions 'MANAGE_CHANNELS', 'MANAGE_ROLES'
module.exports = {
    data: new SlashCommandBuilder()
        .setName('getreactions')
        .setDescription('Get reactions from a message')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The message id you would like to get reactions from')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel this message is in')
                .setRequired(true)),
    async execute(interaction) {
        const options = interaction.options;
        const messageId = options.getString('message_id');
        const channel = options.getChannel('channel');

        channel.messages.fetch(messageId).then((ReactionsMessage) => {
            const users = {};
            ReactionsMessage.reactions.cache.forEach((reaction) => {
                users[reaction.emoji] = [];
                reaction.users.fetch().then(result => {
                    result.forEach(user => {
                        users[reaction.emoji].push('<@' + user.id + '>');
                    });
                    const attachment = new Discord.MessageAttachment(Buffer.from(`${users[reaction.emoji].join('\n')}`, 'utf-8'), 'emoji reactions.txt');
                    interaction.channel.send({ content: `Users that reacted with ${reaction.emoji}`, files: [attachment] });
                });
            });
        }).catch((error) => {
            console.log(error);
            interaction.reply({ content: `Message with ID ${messageId} wasn't found in channel <#${channel.id}>` });
        });
    },
};