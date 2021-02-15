const { CommandoClient } = require('discord.js-commando');
const Discord = require('discord.js');
const DiscordUtil = require('./common/discordutil');
const path = require('path');
const { prefix, token, webhookUserId } = require("./config.json");
const { json } = require('sequelize/types');

const client = new CommandoClient({
	commandPrefix: prefix,
	owner: '708723153605754910'
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['reminder', 'Command Group for Reminder functionalities'],
		['sejong', 'Command Group for Sejong functionalities']
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
	console.log(`Bang PD is online!`);
	client.user.setActivity('BE', { type: 'LISTENING' });
});

//This is a hack to set reminders without needing to setup a webhook for every channel
client.on("message", (message) => {
  if (
    message.content.startsWith("{") &&
    message.content.endsWith("}") &&
    message.author.bot &&
    message.author.id == webhookUserId
  ) {
    const jsonObj = JSON.parse(message);
    const targetChannel = client.channels.cache.get(jsonObj.targetChannelId);
    var mention = jsonObj.mentionRole;
    if (mention.trim()){
      mention = "\n<@&" + jsonObj.mentionRole + ">\n";
    }
    targetChannel.send(mention +jsonObj.reminderMessage);
  }
});

// CATCH RAW REACTION
const rawEventTypes = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
};

client.on('raw', async (event) => {
  if (!rawEventTypes[event.t]) return;
  const { d: data } = event;
  const user = client.users.cache.get(data.user_id);
  const channel = client.channels.cache.get(data.channel_id) || await user.createDM();

  const message = await channel.messages.fetch(data.message_id);
  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;

  let reaction = message.reactions.cache;
  if (!reaction) {
    const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
    reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
  }
});

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.author.id === client.user.id && reaction.emoji.name === '❌' && reaction.message.channel.type !== 'text') {
    if (user.id !== client.user.id) {
      reaction.message.delete();
    }
  }
  if (reaction.emoji.name === '🔖' && reaction.message.channel.type === 'text') {
    if (user.id !== client.user.id) {
      if (reaction.message.embeds[0] && reaction.message.author.id === client.user.id) {
        const embed = reaction.message.embeds[0];
        user.send({ embed }).then(msg => msg.react('❌'));
        console.log(`${user.username} - result bookmark `);
      } else {
        console.log(`${user.username} - message bookmark `);
        DiscordUtil.bookmark(reaction.message, user);
      }
    }
  }
});

client.on('error', console.error);

client.login(token);