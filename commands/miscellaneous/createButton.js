const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createbutton')
    .setDescription('Send button')
    .addChannelOption(option =>
        option.setName('channel')
        .setDescription('The message channel')
        .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
        .setRequired(true))
    .addStringOption(option =>
        option.setName('description')
            .setDescription('The message to be sent with the reaction buttons')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('button_text')
            .setDescription('The text in the button')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('button_type')
            .setDescription('The type of button to send')
            .setRequired(false)
            .addChoice('Library Card Renewal', 'renewLibraryCard')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('emoji')
            .setDescription('The emoji in the button')),

  async execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const options = interaction.options;
    const channel = options.getChannel('channel');
    const description = options.getString('description');
    const emojiString = options.getString('emoji') ? options.getString('emoji') : '';
    const buttonText = options.getString('button_text');
    const buttonType = options.getString('button_type');
    const row = new MessageActionRow();
    const isEmoji = emojiString.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
    if (emojiString && !isEmoji) {
        return interaction.followUp(`${emojiString} is not a valid emoji!`);
    }
    const emoji = emojiString ? isEmoji[0] : '';

    row.addComponents(
        new MessageButton()
            .setCustomId(`run_${buttonType}_${interaction.createdTimestamp}`)
            .setLabel(`${buttonText}`)
            .setStyle('PRIMARY')
            .setEmoji(`${emoji}`)
    );

    await channel.send({ content: description, components: [row] });
    await interaction.followUp({ content: 'Message sent! <a:taeArmybomb:921121105861804063>', ephemeral: true });
  }
};