const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, botToken } = require('./config.json');

const commands = [];
const commandFilesMisc = fs.readdirSync('./commands/miscellaneous').filter(file => file.endsWith('.js'));

for (const file of commandFilesMisc) {
    const command = require(`./commands/miscellaneous/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(botToken);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
    } catch (error) {
        console.error(error);
    }
})();
