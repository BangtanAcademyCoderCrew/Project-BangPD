const { SlashCommandBuilder, roleMention } = require('@discordjs/builders');

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
		const options = interaction.options
		const roleID = options.getRole('role').id;
		const commandName = options.getString('command');
		const cmd = await interaction.guild.commands.fetch().then(commands => {
			return commands.find(cmd => cmd.name === commandName)
		})
		if (!cmd){
			return interaction.reply(`Command ${commandName} not found. <:shookysad:949689086665437184>`)
		}
		const permissions = [
			{
				id: roleID,
				type: 'ROLE',
				permission: true,
			},
		];
		
		await cmd.permissions.add({ permissions });

		interaction.reply(`You added the role ${roleMention(roleID)} to use the command ${commandName}.`) 
	},
};