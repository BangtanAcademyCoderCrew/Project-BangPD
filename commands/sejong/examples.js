const { ApplicationCommandOptionType } = require("discord-api-types/v9");
const { DMChannel } = require("discord.js");
const DiscordUtil = require("../../common/discordutil.js");
const ExampleSentenceAPI = require("../../api/exampleapi.js");

module.exports = {
  data: {
    name: "examples",
    group: "dictionary",
    description: "Search the dictionary for example sentences.",
    options: [
      {
        name: "word",
        type: ApplicationCommandOptionType.String,
        description: "The word to look up examples for",
        required: true,
      },
    ],
  },

  async execute(interaction) {
    const query = interaction.options.getString("word");
    const api = new ExampleSentenceAPI();
    const isDM = interaction.channel instanceof DMChannel;

    await interaction.deferReply();

    const response = await api.searchExamples(query);
    await interaction.editReply(
      send(api.parseExampleResult(response), interaction)
    );

    function send(dicEntries, interaction) {
      const exEmbed = DiscordUtil.createExampleResultEmbed(
        "en",
        query,
        interaction.user.username,
        isDM,
        dicEntries
      );

      if (dicEntries.length === 0) {
        interaction.editReply({ embeds: [exEmbed] });
        return;
      }
      interaction.editReply({ embeds: [exEmbed] }).then((msg) => {
        if (!isDM) msg.react("🔖");
      });
    }
  },
};
