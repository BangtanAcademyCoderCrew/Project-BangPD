const Hanja = require('../../hanja/sql');
const DiscordUtil = require('../../common/discordutil.js');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const { DMChannel, MessageButton } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');

module.exports = {
  data: {
    name: 'hanja',
    group: 'dictionary',
    description: 'Search for Hanja in English, Korean, or Hanja itself.',
    options: [
      {
        name: 'word',
        description: 'What is the word?',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },

  async execute(interaction) {
    const args = interaction.options.getString('word');
    const isDM = interaction.channel instanceof DMChannel;
    const hanja = new Hanja();

    await interaction.deferReply();

    const response = await hanja.searchWords(args);

    await interaction.editReply(send(response, interaction)).then((msg) => {
      if (!isDM) msg.react('🔖');
    });

    function send(response, interaction) {
      const pages = DiscordUtil.createHanjaEmbeds(
        response.query,
        interaction.user.username,
        isDM,
        response
      );

      const button1 = new MessageButton()
        .setCustomId('previousbtn')
        .setLabel('Previous')
        .setStyle('DANGER');

      const button2 = new MessageButton()
        .setCustomId('nextbtn')
        .setLabel('Next')
        .setStyle('SUCCESS');

      const buttonList = [button1, button2];

      paginationEmbed(interaction, pages, buttonList);
    }
  }
};
