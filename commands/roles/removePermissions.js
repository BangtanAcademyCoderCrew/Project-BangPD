const { SlashCommandBuilder, roleMention } = require('@discordjs/builders');
const { ApplicationCommandPermissionTypes } = require('discord.js/typings/enums');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removepermissions')
		.setDescription('Remove permissions to command')
		.setDefaultPermission(false)
		.addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to remove permission')
                .setRequired(true))
		.addStringOption(option =>
			option.setName('command')
				.setDescription('Name of the command to update permissions')
				.setRequired(true)),
	async execute(interaction) {
		const options = interaction.options;
		const roleID = options.getRole('role').id;
		const commandName = options.getString('command');
		const cmd = await interaction.guild.commands.fetch().then(commands => {
			return commands.find(command => command.name === commandName);
		});
		if (!cmd) {
			return interaction.reply({ content:`Command ${commandName} not found. <:shookysad:949689086665437184>` });
		}
		const permissions = [
			{
				id: roleID,
				type: ApplicationCommandPermissionTypes.ROLE,
				permission: false
			}
		];

		await cmd.permissions.add({ permissions });

		interaction.reply({ content:`You removed the role ${roleMention(roleID)} to use the command ${commandName}.` });
	}
};