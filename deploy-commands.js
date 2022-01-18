const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, botToken } = require('./config.json');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = commandFiles.map((file) => {
    const command = require(`./commands/${file}`);
    return command.data.toJSON();
});

const rest = new REST({ version: '9' }).setToken(botToken);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
    }
    catch (error) {
        console.error(error);
    }
})();
