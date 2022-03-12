const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, botToken, commandDirectories } = require('./config.json');
const { setCommandPermissions } = require('./command-permissions');

const commands = [];
commandDirectories.forEach(dir => {
  const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
  commandFiles.forEach((file) => {
    const command = require(`${dir}/${file}`);

    if(command.data.group){
      commands.push(command.data);
    } else {
      commands.push(command.data.toJSON());
    }
  });
});

const rest = new REST({ version: '9' }).setToken(botToken);

(async () => {
  try {
    const createdCommands = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    await setCommandPermissions(createdCommands);
  }
  catch (error) {
    console.error(error);
  }
})();
