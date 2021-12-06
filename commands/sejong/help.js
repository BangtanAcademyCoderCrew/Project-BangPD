const DiscordUtil = require("../../common/discordutil");
const { ApplicationCommandOptionType } = require("discord-api-types/v9");
const { MessageActionRow, MessageSelectMenu } = require('discord.js');


module.exports = {
  name: "dictionary-help",
  //cooldown: 3,
  //group: 'dictionary',
  //aliases: ['dict-h', 'dict-help'],
  //memberName: 'dictionary-help',
  description: "shows options and examples for all dictionary commands",

  async execute(interaction) {

    const row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('select')
        .setPlaceholder('Nothing selected')
        .addOptions([
          {
            label: 'Select me',
            description: 'This is a description',
            value: 'first_option',
          },
          {
            label: 'You can select me too',
            description: 'This is also a description',
            value: 'second_option',
          },
        ]),
    );
    
    const filter = i => {
      i.deferUpdate();
      return i.user.id === interaction.user.id;
    };

    
    interaction.reply({ content: 'Pong!', components: [row] }).then(() => {
      interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .then(collected => {
          interaction.followUp(`You selected ${interaction.values.join(", ")}!`);
        })
        .catch(collected => {
          interaction.followUp('Looks like nobody got the answer this time.');
        });
    });

      /*
    const args = interaction.options.getString("command");

    const commands = message.client.registry.groups.get("dictionary").commands;

    if (!args.length) {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }

    const name = args[0].toLowerCase();
    if (name === "all") {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }
    const command =
      commands.get(name) ||
      commands.find((c) => c.aliases && c.aliases.includes(name));

    if (!command || command.devOnly) {
      message.reply(`**${name}** does not seem to be a valid command!`);
      return;
    }

    const detailHelpEmbed = DiscordUtil.createDetailHelpEmbed(command);
    message.channel.send(detailHelpEmbed);
    */
  },
};
