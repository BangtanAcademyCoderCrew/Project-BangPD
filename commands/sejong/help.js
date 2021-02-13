const DiscordUtil = require('../../common/discordutil');
const { Command } = require('discord.js-commando');


module.exports = class SejongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sejong-help',
      cooldown: 3,
      group: 'sejong',
      memberName: 'sejong-help',
      description: 'shows options and examples for all sejong commands',
      args: [
        {
          key:'command',
          prompt:'What is the command?',
          type: 'string'
        }
      ]
    })
  }

  run(message, args) {
    args = [args.command];
    const commands = message.client.registry.groups.get('sejong').commands;

    if (!args.length) {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }

    const name = args[0].toLowerCase();
    if (name === 'all') {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command || command.devOnly) {
      message.reply(`**${name}** does not seem to be a valid command!`);
      return;
    }


    const detailHelpEmbed = DiscordUtil.createDetailHelpEmbed(command);
    message.channel.send(detailHelpEmbed);
  }
};
