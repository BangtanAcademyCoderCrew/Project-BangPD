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
        commands.push(command.data.toJSON());
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
        // const permissions = createdCommands.filter(command => command.default_permission === false).map(command => command.id);
        // // console.log('permissions', permissions)

        // // get all roles with permissions for MANAGE_MESSAGES, MANAGE_CHANNELS, MANAGE_ROLES

        // // guildRoles
        // const roles = await rest.get(
        //     Routes.guildRoles(guildId)
        // );
        // console.log('total:', roles.length);
        // const filtered = roles.filter(role => {
        //     // Converts permission bitwise string to a Permissions object
        //     const permission = new Permissions(role.permissions)
        //     return permission.has(Permissions.FLAGS.MANAGE_ROLES);
        // });
        // console.log('filtered:', filtered.length);

        // guildApplicationCommandsPermissions
        // await rest.put(
        //     Routes.guildApplicationCommandsPermissions(clientId, guildId),
        //     { body: commands },
        // );
    }
    catch (error) {
        console.error(error);
    }
})();
