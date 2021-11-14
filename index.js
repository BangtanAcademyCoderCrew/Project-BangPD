const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const Discord = require('discord.js');
const DiscordUtil = require('./common/discordutil');
const path = require('path');
const got = require('got');
const { DateTime } = require("luxon");
const {
	prefix, enabledCommands, status, devIds, llkId, devServerId, enableDictionaryReply, token
  } = require('./config.json');

const client = new Client({
	//defaultPrefix: prefix,
	//owner: '708723153605754910',
  //partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
  //intents: ['GUILD_PRESENCES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});



client.commands = new Collection();
const examplecommand = require(`./commands/sejong/examples.js`);
const hanjacommand = require(`./commands/sejong/hanja.js`);
client.commands.set(examplecommand.name, examplecommand);
client.commands.set(hanjacommand.name, hanjacommand);

const commands = client.commands.map(({ execute, ...data }) => data); 
console.log(commands);
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands');

		await rest.put(
			Routes.applicationGuildCommands('811088229746343998', '810579429608390716'),
			{ body: commands },
		);

		console.log('Sucessfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

//const commandDirs = fs.readdirSync('./commands');

/*
const commandFiles = fs.readdirSync(`./commands/sejong`).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  console.log(file);
  const command = require(`./commands/sejong/${file}`);
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module

  client.commands.set(command.name, command);
}

/*
for(const commandDir of commandDirs){
  const commandFiles = fs.readdirSync(`./commands/${commandDir}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    console.log(file);
    const command = require(`./commands/${commandDir}/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    console.log(command);
    console.log(command.name);
    client.commands.set(command.name, command);
  }
}
*/




/*
client.registry
	.registerDefaultTypes()
	.registerGroups([
		['reminder', 'Command Group for Reminder functionalities'],
		['dictionary', 'Command Group for Dictionary functionalities'],
    ['roles', 'Command Group for role management'],
    ['miscellaneous', 'Command Group for misc commands']
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

  */

client.once('ready', () => {
	console.log(`Bang PD is online!`);
  client.user.setActivity('BE', { type: 'LISTENING' });

});

client.on('interactionCreate', async interaction => {
  console.log("received interaction");
	if (!interaction.isCommand()) return;

  console.log("interaction is a command");

	if (!client.commands.has(interaction.commandName)) return;

  console.log("command recognized");

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


/*
client.on('messageCreate', async message => {
  //console.log(message);
	if (!client.application?.owner) await client.application?.fetch();

  //console.log(client.application?.owner.id);
  //650144159432310784

	if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner.id) {
		const data = {
			name: 'ping',
			description: 'Replies with Pong!',
		};

		const command = await client.application?.commands.create(data);
		console.log(command);
	}
});

/*
client.on('messageCreate', async message => {
	if (!client.application?.owner) await client.application?.fetch();

	if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner.id) {
		const data = {
			name: 'ping',
			description: 'Replies with Pong!',
		};

		const command = await client.application?.commands.create(data);
		console.log(command);
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

*/

client.on('error', console.error);

client.login(token);