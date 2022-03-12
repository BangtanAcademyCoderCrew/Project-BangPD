const fs = require('fs');
const { Client, Collection, Emoji, Intents, MessageReaction } = require('discord.js');
const DiscordUtil = require('./common/discordutil');
const { botToken, commandDirectories } = require('./config.json');

const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

client.commands = new Collection();
commandDirectories.forEach(dir => {
  const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
  commandFiles.forEach((file) => {
    const command = require(`${dir}/${file}`);
    client.commands.set(command.data.name, command);
  });
});

client.once('ready', () => {
  console.log('Bang PD is online!');
  client.user.setActivity('BE', { type: 'LISTENING' });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  }
  catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.partial && !user.bot) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

	if (user.id === client.user.id || user.bot ){
		return;
	}
	const validChannels = ["GUILD_TEXT", "GUILD_PUBLIC_THREAD", "GUILD_PRIVATE_THREAD"]
	if (reaction.emoji.name === '🔖' && validChannels.includes(reaction.message.channel.type)) {
		if (reaction.message.embeds[0] && reaction.message.author.id === client.user.id) {
      const embed = reaction.message.embeds[0];
      user.send({ embeds: [embed] }).then(msg => msg.react('❌'));
      console.log(`${user.username} - result bookmark `);
    } else {
      console.log(`${user.username} - message bookmark `);
      DiscordUtil.bookmark(reaction.message, user);
    }
	}
  if (reaction.emoji.name === '❌' && !validChannels.includes(reaction.message.channel.type)){
    if (user.id !== client.user.id && reaction.message.author.id == client.user.id) {
      reaction.message.delete();
    }
  }
});

/*

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
    const emoji = new Emoji(client.guilds.get(data.guild_id), data.emoji);
    reaction = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  // When we receive a reaction we check if the reaction is partial or not
  if (reaction.partial) {
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
      await reaction.fetch();
    }
    catch (error) {
      console.error('Something went wrong when fetching the message: ', error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  if (reaction.message.author.id === client.user.id && reaction.emoji.name === '❌' && reaction.message.channel.type !== 'text') {
    if (user.id !== client.user.id) {
      await reaction.message.delete();
    }
  }

  if (reaction.emoji.name === '🔖' && reaction.message.channel.type === 'text') {
    if (user.id !== client.user.id) {
      if (reaction.message.embeds[0] && reaction.message.author.id === client.user.id) {
        const embed = reaction.message.embeds[0];
        user.send({ embeds: [embed] }).then(msg => msg.react('❌'));
        console.log(`${user.username} - result bookmark `);
      }
    }
    else {
      console.log(`${user.username} - message bookmark `);
      DiscordUtil.bookmark(reaction.message, user);
    }
  }
});

// log voice channel join/leave activities
client.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => {
  const newVoiceChannel = newVoiceState.channelId;
  const oldVoiceChannel = oldVoiceState.channelId;

  // TODO: Update these channel IDs to the correct ones
  const voiceChannelId = '825428308749058119';
  const logChannelId = '807333762433548328';

  const logChannel = client.channels.cache.get(logChannelId);
  const voiceChannel = client.channels.cache.get(voiceChannelId);
  const memberId = newVoiceState.member.user.id;
  const username = newVoiceState.member.user.tag;

  // User joins a voice channel
  if (!oldVoiceChannel && newVoiceChannel === voiceChannelId) {
    const joinEmbed = DiscordUtil.createLoggingEmbed(
      `:arrow_right: <@${memberId}> - ${username} joined **${voiceChannel.name}**`,
      'GREEN'
    );
    logChannel.send({ embeds: [joinEmbed] });

  }
  // User leaves a voice channel
  else if (!newVoiceChannel && oldVoiceChannel === voiceChannelId) {
    const leaveEmbed = DiscordUtil.createLoggingEmbed(
      `:arrow_left: <@${memberId}>  - ${username} left **${voiceChannel.name}**`,
      'RED'
    );
    logChannel.send({ embeds: [leaveEmbed] });
  }
  // User switches to/from voice channel
  else if (newVoiceChannel && oldVoiceChannel && (newVoiceChannel === voiceChannelId || oldVoiceChannel === voiceChannelId)) {
    // User starts/stops streaming
    if (newVoiceState.streaming && !oldVoiceState.streaming) {
      const startStreamingEmbed = DiscordUtil.createLoggingEmbed(
        `:desktop: <@${memberId}> - ${username} started streaming.`,
        'PURPLE'
      );
      logChannel.send({ embeds: [startStreamingEmbed] });
    }
    // stops streaming
    else if (!newVoiceState.streaming && oldVoiceState.streaming) {
      const stopStreamingEmbed = DiscordUtil.createLoggingEmbed(
        `:desktop: <@${memberId}> - ${username} stopped streaming.`,
        'PURPLE'
      );
      logChannel.send({ embeds: [stopStreamingEmbed] });
    }
    // switched to tour voice channel
    else {
      const switchEmbed = DiscordUtil.createLoggingEmbed(
        `:repeat: <@${memberId}> - ${username} switched from **${oldVoiceState.channel.name}** to **${newVoiceState.channel.name}**`,
        'YELLOW'
      );
      logChannel.send({ embeds: [switchEmbed] });
    }
  }
});

*/

client.on('error', console.error);

client.login(botToken);
