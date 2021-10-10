const DiscordUtil = require('../../common/discordutil.js');
const ExampleSentenceAPI = require('../../api/exampleapi.js');
const {ApplicationCommandOptionType} = require('discord-api-types/v9');
const { DMChannel } = require('discord.js');

  module.exports = {

    name: 'examples',
    description: 'Search the dictionary for example sentences.',
    options: [{
      name: 'word',
      type: ApplicationCommandOptionType.String,
      description: 'The word to look up examples for',
      required: true,
    }],

  async execute(interaction) {
    const q = interaction.options.getString('word');
    const api = new ExampleSentenceAPI();
    const isDM = interaction.channel instanceof DMChannel;

    await interaction.deferReply();

    const response = await api.searchExamples(q);
    await interaction.editReply(send(api.parseExampleResult(response), interaction));


    function send(dicEntries, interaction) {
      const exEmbed = DiscordUtil.createExampleResultEmbed('en', q, interaction.user.username, isDM, dicEntries);
      
      console.log(exEmbed);
      if (dicEntries.length === 0) {
        interaction.editReply({embeds: [exEmbed]});
        return;
      }
      interaction.editReply({embeds: [exEmbed]})
      .then((msg) => {
        if (!isDM) msg.react('🔖');
      });
    }
  }
};
