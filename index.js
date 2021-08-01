const { CommandoClient } = require('discord.js-commando');
const Discord = require('discord.js');
const DiscordUtil = require('./common/discordutil');
const path = require('path');
const got = require('got');
const { DateTime } = require("luxon");
const {
	prefix, enabledCommands, status, devIds, llkId, devServerId, enableDictionaryReply, token
  } = require('./config.json');

const client = new CommandoClient({
	commandPrefix: prefix,
	owner: '708723153605754910',
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: ['GUILD_PRESENCES', 'GUILD_MEMBERS']
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['reminder', 'Command Group for Reminder functionalities'],
		['dictionary', 'Command Group for Dictionary functionalities'],
    ['roles', 'Command Group for adding roles'],
    ['miscellaneous', 'Other commands']
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
	console.log(`Bang PD is online!`);
  client.user.setActivity('BE', { type: 'LISTENING' });

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

client.on('messageReactionAdd', async (reaction, user) => {
  // When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

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

//log voice channel join/leave activities
client.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => {
  const newVoiceChannel = newVoiceState.channelID;
  const oldVoiceChannel = oldVoiceState.channelID;

  //TODO: Update these channel IDs to the correct ones
  const voiceChannelId = '825428308749058119';
  const logChannelId = '807333762433548328';

  const logChannel = client.channels.cache.get(logChannelId);
  const voiceChannel = client.channels.cache.get(voiceChannelId);
  const memberId = newVoiceState.member.user.id;
  const username = newVoiceState.member.user.tag;

  // User joins a voice channel
  if(!oldVoiceChannel && newVoiceChannel === voiceChannelId)
  { 
    const joinEmbed = DiscordUtil.createLoggingEmbed(
      `:arrow_right: <@${memberId}> - ${username} joined **${voiceChannel.name}**`,
      'GREEN'
    );
      logChannel.send(joinEmbed);
    
  }
  // User leaves a voice channel
  else if(!newVoiceChannel && oldVoiceChannel === voiceChannelId) {

    const leaveEmbed = DiscordUtil.createLoggingEmbed(
      `:arrow_left: <@${memberId}>  - ${username} left **${voiceChannel.name}**`,
      'RED'
    );
      logChannel.send(leaveEmbed);
  }
  // User switches to/from voice channel
  else if (newVoiceChannel && oldVoiceChannel && (newVoiceChannel === voiceChannelId || oldVoiceChannel === voiceChannelId)){
    //User starts/stops streaming
    if(newVoiceState.streaming && !oldVoiceState.streaming){

      const startStreamingEmbed = DiscordUtil.createLoggingEmbed(
        `:desktop: <@${memberId}> - ${username} started streaming.`,
        'PURPLE'
      );

      logChannel.send(startStreamingEmbed);

    }
    //stops streaming
    else if(!newVoiceState.streaming && oldVoiceState.streaming){

      const stopStreamingEmbed = DiscordUtil.createLoggingEmbed(
        `:desktop: <@${memberId}> - ${username} stopped streaming.`,
        'PURPLE'
      );

      logChannel.send(stopStreamingEmbed);
    }
    //switched to tour voice channel
    else {
      const switchEmbed = DiscordUtil.createLoggingEmbed(
        `:repeat: <@${memberId}> - ${username} switched from **${oldVoiceState.channel.name}** to **${newVoiceState.channel.name}**`,
        'YELLOW'
      );

      logChannel.send(switchEmbed);
    }
  }
});


client.on('error', console.error);

client.login(token);