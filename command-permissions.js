/**
 * This file contains the code for setting permissions on non-public commands.
 * The SlashCommandBuilder doesn't have any methods that allow you to set specific permissions for commands.
 * For restricted commands, we set the default permissions to false and then on deploy of the commands,
 * we run setCommandPermissions to assign the appropriate permissions. In some cases, permissions are checked
 * at the time the command is run. This is due to the Discord API limiting the number of permission overwrites
 * through the API to 10. In our case, this means that only up to 10 roles can be allotted permissions per command.
 *
 * Miscellaneous
 * - areActiveStudents: MANAGE_MESSAGES (checked in command)
 * - getReactions: MANAGE_CHANNELS, MANAGE_ROLES
 *
 * Role
 * - addRole: MANAGE_CHANNELS, MANAGE_ROLES
 * - addTempRole: MANAGE_CHANNELS, MANAGE_ROLES
 * - giveTheApples: MANAGE_ROLES
 * - ccssGiveTheApples: MANAGE_ROLES
 * - removeRole: MANAGE_CHANNELS, MANAGE_ROLES
 * - roleIn: MANAGE_ROLES
 * - roleRin: MANAGE_ROLES
 * - rolesToUserMentioned: MANAGE_ROLES
 * - rollCall: MANAGE_CHANNELS, MANAGE_ROLES
 */

const { Permissions } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes, ApplicationCommandPermissionType } = require('discord-api-types/v9');
const { clientId, guildId, botToken } = require('./config.json');
const customPermissions = require('./customPermissions.json');


const commandsWithPermissions = [
  // can MANAGE_ROLES and MANAGE_CHANNELS
  {
    permissions: [Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_ROLES],
    roleNames: [
      'addrole',
      'getreactions',
      'temp-role',
      'removerole',
      'rollcall',
      'reactions'
    ]
  },
  // can MANAGE_ROLES
  {
    permissions: [Permissions.FLAGS.MANAGE_ROLES],
    roleNames: [
      'addpermissions',
      'addrolestouserinmessage',
      'ccssgivetheapples',
      'getusersinserver',
      'getusernames',
      'givetheapples',
      'removepermissions',
      'removerolestouserinmessage',
      'role_in',
      'role_rin',
      'userNames',
      'usersPerServer'
    ]
  },
  // can MANAGE_CHANNELS
  {
    permissions: [Permissions.FLAGS.MANAGE_CHANNELS],
    roleNames: [
      'setreminder'
    ]
  },
  // can MANAGE_MESSAGES
  {
    permissions: [Permissions.FLAGS.MANAGE_MESSAGES],
    roleNames: [
      'areactivestudents'
    ]
  }
];

module.exports = {
  setCommandPermissions: async (commands) => {
    const rest = new REST({ version: '9' }).setToken(botToken);
    const filteredCommands = commands.filter(command => command.default_permission === false);

    const roles = await rest.get(
      Routes.guildRoles(guildId)
    );

    // Build permissions body
    const permissionsBody = [];
    commandsWithPermissions.forEach(obj => {
      const rolesWithPermissions = roles.filter(role => {
        const permission = new Permissions(role.permissions);
        return permission.has(obj.permissions);
      }).map(role => {
        return {
          id: role.id,
          type: ApplicationCommandPermissionType.Role,
          permission: true
        };
      });
      obj.roleNames.map(name => {
        const comm = filteredCommands.find(command => command.name === name);
        if (!comm) {
          return;
        }

        if (comm.id in customPermissions) {
          permissionsBody.push({ id: comm.id, permissions: rolesWithPermissions.concat(customPermissions[comm.id].permissions) });
        } else if (comm.id) {
          permissionsBody.push({ id: comm.id, permissions: rolesWithPermissions });
        }
      });
    });

    try {
      await rest.put(
        Routes.guildApplicationCommandsPermissions(clientId, guildId),
        { body: permissionsBody }
      );
    } catch (error) {
      console.error(error);
    }
  }
};
