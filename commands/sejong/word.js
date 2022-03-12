const KrDicApi = require("../../api/krdicapi.js");
const DiscordUtil = require("../../common/discordutil.js");
const Paginator = require("../../common/paginator");
const paginationEmbed = require("discordjs-button-pagination");
const { ApplicationCommandOptionType } = require("discord-api-types/v9");
const { DMChannel, MessageButton } = require("discord.js");

module.exports = {
  data: {
    name: "word",
    group: "dictionary",
    description: "Search the dictionary for a Korean word.",
    //details: 'Searches the dictionary for the Korean word provided and lists found results along with respective meanings. Results come from the National Institute of Korean Language\'s Korean-English Learners\' Dictionary.\r\n\r\nEnglish definitions are displayed by default.\r\n\r\nUse the Korean / English flag reactions to swap the language of the meanings, or use the book reaction to bookmark the message to DMs.',
    //aliases: ['w'],
    //group: 'dictionary',
    //examples: [`${prefix}word 나무`],
    options: [
      {
        name: "word",
        description: "What is the word?",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ]
  },

  //TODO: Figure out how to throttle

  /*
    throttling: {
      usages: 1,
      duration: 20
    },
    */

  async execute(interaction) {
    //args = [args];
    const isDM = interaction.channel instanceof DMChannel;
    //const q = args.join(" ");
    const q = interaction.options.getString("word");
    const api = new KrDicApi();

    await interaction.deferReply();

    const response = await api.searchWords(q, 5, 7);

    await interaction.editReply(send(response, interaction)).then((msg) => {
      if (!isDM) msg.react("🔖");
    });

    function send(result, interaction) {
      const enEmbed = DiscordUtil.createWordSearchEmbed(
        "en",
        q,
        interaction.user.username,
        isDM,
        result
      );
      const krEmbed = DiscordUtil.createWordSearchEmbed(
        "ko",
        q,
        interaction.user.username,
        isDM,
        result
      );

      if (result.length === 0) {
        interaction.editReply({ embeds: [exEmbed] });
        return;
      }

      const pages = [enEmbed, krEmbed];

      const button1 = new MessageButton()
        .setCustomId("english")
        .setLabel("🇬🇧")
        .setStyle("PRIMARY");

      const button2 = new MessageButton()
        .setCustomId("korean")
        .setLabel("🇰🇷")
        .setStyle("PRIMARY");

      const buttonList = [button1, button2];

      paginationEmbed(interaction, pages, buttonList);

      /*
      const paginator = new Paginator(
        message.author,
        pages,
        "🇬🇧",
        "🇰🇷",
        false,
        true,
        "You can no longer switch languages. Anyone can still bookmark this message."
      );
      paginator.start(answerMessage);
      */
    }
    /*
    const pendingEmbed = DiscordUtil.createPendingEmbed(
      message.author.username
    );
    message.channel.send(pendingEmbed).then((answerMessage) => {
      promise.then(
        (result) => {
          send(result, answerMessage);
        },
        (err) => {
          throw new Error(err);
        }
      );
    });
    */
  },
};
