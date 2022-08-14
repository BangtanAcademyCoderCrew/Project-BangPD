const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const DiscordUtil = require('./common/discordutil');
const { botToken, commandDirectories } = require('./config.json');
const { deployCommands } = require('./deploy-commands');

const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
  intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ]
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
  deployCommands();
  client.user.setActivity('BE', { type: 'LISTENING' });
});

client.on('interactionCreate', async (interaction) => {
  
  if (interaction.isButton()){
		const command = client.commands.get(interaction.customId.split("_")[0]);
		try {
			await command.executeButton(interaction);
		} catch (error) {
			console.error(error);
			return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

  if (interaction.isCommand() || interaction.isContextMenu()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      return interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    }
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

  if (user.id === client.user.id || user.bot) {
    return;
  }
    const validChannels = ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'];
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
    if (reaction.emoji.name === '❌' && !validChannels.includes(reaction.message.channel.type)) {
      if (user.id !== client.user.id && reaction.message.author.id == client.user.id) {
        reaction.message.delete();
      }
    }
});

/*

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
