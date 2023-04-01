const { ApplicationCommandOptionType } = require("discord-api-types/v9");
const { DMChannel } = require("discord.js");
const DiscordUtil = require("../../common/discordutil.js");
const PapagoApi = require("../../api/papagoapi.js");
const langs = require("../../common/langs.js");
const { prefix } = require("../../config.json");

module.exports = {
  data: {
    name: "papago",
    group: "dictionary",
    description: "Translate a text using Papago.",
    /*
      details: `Translate a sentence using Papago. Use ${prefix}papago to translate from Korean to English (default).
      \r\nUse ${prefix}papago [source]>[target] [text] to specify both the target and source language.\r\n
      The available language codes are: ko (Korean), en (English), zh-CN (Chinese), zh-TW (Taiwanese), es (Spanish), fr (French), vi (Vietnamese), th (Thai), id (Indonesian).
      \r\nThe available combinations are:\r\nko<->en\r\nko<->zh-CN\r\nko<->zh-TW\r\nko<->es\r\nko<->fr\r\nko<->vi\r\nko<->th\r\nko<->id\r\nen<->ja\r\nen<->fr`,
      */
    // aliases: ['p', 'ppg'],
    options: [
      {
        name: "text",
        description: "What is the text to translate?",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "language_codes",
        description: "What are the language codes?",
        type: ApplicationCommandOptionType.String,
      },
    ],
    // examples:[ `${prefix}papago ko>en 안녕하세요`],
    // cooldown: 5
  },

  async execute(interaction) {
    let source = "ko";
    let target = "en";
    const language_codes = interaction.options.getString("language_codes");
    const text = interaction.options.getString("text");
    const args = [language_codes, text];
    const isDM = interaction.channel instanceof DMChannel;

    if (language_codes) {
      const l = language_codes.split(">");
      if (l.length === 2) {
        [source, target] = l;
      }
    }

    if (!langs[source] || !langs[target]) {
      interaction.reply(`enter a valid combination of languages. The available combinations are:
        \r\nko<->en\r\nko<->zh-CN\r\nko<->zh-TW\r\nko<->es\r\nko<->fr\r\nko<->vi\r\nko<->th\r\nko<->id\r\nen<->ja\r\nen<->fr`);
      return;
    }

    if (source === target) {
      interaction.reply("source and target language must be different");
      return;
    }

    const p = new PapagoApi();

    await interaction.deferReply();
    const response = await p.translate(text, source, target);

    await interaction.editReply(send(response, interaction));

    function send(result, interaction) {
      interaction
        .editReply({
          embeds: [DiscordUtil.createTranslationResultEmbed(result)],
        })
        .then((msg) => {
          if (!isDM) msg.react("🔖");
        });
    }
  },
};
