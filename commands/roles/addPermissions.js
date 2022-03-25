const { SlashCommandBuilder, roleMention } = require('@discordjs/builders');
const { ApplicationCommandPermissionType } = require('discord-api-types/v9');
const fs = require('fs');
var path = require("path");
const fileName = '../../customPermissions.json';
var pathToJson = path.resolve(__dirname, fileName);
var file = require(pathToJson);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpermissions')
    .setDescription('Add permissions to command')
    .setDefaultPermission(false)
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to add permission')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Name of the command to update permissions')
        .setRequired(true)),
  async execute(interaction) {
    const options = interaction.options;
    const roleID = options.getRole('role').id;
    const commandName = options.getString('command');

    const writeToFile = (commandId, permissions) => {
      if (commandId in file){
        file[commandId].permissions = file[commandId].permissions.concat(permissions)
      } else {
        file[commandId] = { 
          id:cmd.id, 
          permissions:permissions 
        }
      }

      fs.writeFile(pathToJson, JSON.stringify(file), function writeJSON(err) {
          if (err){
              console.log(err);
              return false;
          } 
          console.log(JSON.stringify(file));
          console.log('writing to ' + pathToJson);
      });
    };

    const cmd = await interaction.guild.commands.fetch().then(commands => {
      return commands.find(command => command.name === commandName);
    });
    if (!cmd) {
      return interaction.reply({ content: `Command ${commandName} not found. <a:shookysad:949689086665437184>` });
    }
    const permissions = [
      {
        id: roleID,
        type: ApplicationCommandPermissionType.Role,
        permission: true
      }
    ];

    await cmd.permissions.add({ permissions });
    
    writeToFile(cmd.id, permissions );

    interaction.reply({ content: `You added the role ${roleMention(roleID)} to use the command ${commandName}.` });
  }
};