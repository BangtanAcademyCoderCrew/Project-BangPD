const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const { token } = require('./config.json');

const client = new CommandoClient({
	commandPrefix: '~',
	owner: '650144159432310784',
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
	client.user.setActivity('Streaming BE');
});

client.on('error', console.error);

client.login(token);