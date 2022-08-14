const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder, roleMention } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkifroles')
		.setDescription("blah blah.")
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('regular')
                .setDescription('Checks if a user has a role in this server.')
                .addStringOption(option => 
                    option.setName('description')
                        .setDescription('The message to be sent with the reaction buttons')
                        .setRequired(true))
                .addChannelOption(option => 
                    option.setName('channel')
                    .setDescription('The message channel')
                    .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
                    .setRequired(true))
                .addRoleOption(option => option.setName('role_to_check')
                    .setDescription('The role to check')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role_to_check2')
                    .setDescription('The second role to check')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role_to_add')
                    .setDescription('The role to add')
                    .setRequired(true)))    
        .addSubcommand(subcommand =>
            subcommand
                .setName('crossserver')
                .setDescription('Checks if a user has a role in another server')
                .addStringOption(option => 
                    option.setName('description')
                        .setDescription('The message to be sent with the reaction buttons')
                        .setRequired(true))
                .addChannelOption(option => 
                    option.setName('channel')
                    .setDescription('The message channel')
                    .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
                    .setRequired(true))
                .addStringOption(option => option.setName('guild_id').setDescription('The server ID').setRequired(true))
                .addStringOption(option => option.setName('role_id').setDescription('The role ID').setRequired(true))
                .addRoleOption(option => option.setName('role_to_check2')
                    .setDescription('The second role to check')
                    .setRequired(true))
                .addRoleOption(option => option.setName('role_to_add')
                    .setDescription('The role to add')
                    .setRequired(true))),
	async execute(interaction) {

        var guildId, role;
        const options = interaction.options;
        const channel = options.getChannel('channel');
        var row = new MessageActionRow();
        const subcommandName = options.getSubcommand();
        const roleToAdd = options.getRole('role_to_add');
        const secondRoleToCheck = options.getRole('role_to_check2');
        const description = options.getString('description');

        if (subcommandName === 'regular') {
            guildId = interaction.channel.guild.id;
            role = options.getRole('role_to_check');
        }
        else if (subcommandName === 'crossserver') {
            guildId = options.getString('guild_id');
            const guild = interaction.client.guilds.cache.get(guildId);
            var roleId = options.getString('role_id');
            role = guild.roles.cache.find(r => r.id === roleId);
            if(!role){
                return interaction.reply(`Role ${roleId} not found in server with ID ${guildId}`)
            }
        }

        row.addComponents(
            new MessageButton()
                .setCustomId(`checkifrole_${subcommandName}_${role.id}_${roleToAdd.id}_${secondRoleToCheck.id}_${guildId}`)
                .setLabel(`${roleToAdd.name}`)
                .setStyle('PRIMARY')
                .setEmoji('921121105861804063'),
        );
        console.log(``);
        await channel.send({ content: description, components: [row] });
        await interaction.reply({ content: "Message sent!", ephemeral: true });
	},
    async executeButton(interaction) {
        const [, subcommandName, roleId, roleToAddId, secondRoleToCheckId, guildId] = interaction.customId.split("_");

        const guild = interaction.client.guilds.cache.get(guildId);
        const roleToCheck = guild.roles.cache.find(r => r.id === roleId);
        const secondRoleToCheck = interaction.guild.roles.cache.find(r => r.id === secondRoleToCheckId);
        let memberToUpdate, hasFirstRole, hasSecondRole; 
        const username = `${interaction.member.user.username}#${interaction.member.user.discriminator}`;
        
        if (subcommandName === 'crossserver'){
            memberToUpdate = guild.members.cache.find(m => m.id == interaction.member.id);
            hasFirstRole = memberToUpdate.roles.cache.has(roleId);
            hasSecondRole = interaction.member.roles.cache.has(secondRoleToCheckId);
        }
        else {
            memberToUpdate = interaction.member;
            hasFirstRole = memberToUpdate.roles.cache.has(roleId);
            hasSecondRole = memberToUpdate.roles.cache.has(secondRoleToCheckId);
        }


        console.log(`${username} checked if they had role ${roleId}`);
        if (interaction.member.roles.cache.has(roleToAddId)) {
            interaction.reply({ content: `You already have the${roleMention(roleToAddId)} role`, ephemeral: true });
        }
        else if (hasFirstRole && hasSecondRole) {
            interaction.member.roles.add([roleToAddId]);
            interaction.reply({ content: `I added you the ${roleMention(roleToAddId)} role`, ephemeral: true });
        }
        else {
            interaction.reply({ content: `You need the ${roleToCheck.name} and ${secondRoleToCheck.name} roles to get this role.`, ephemeral: true });
        }
    }
};