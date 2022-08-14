const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder, roleMention } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const { guildId } = require('../../config.json');
const levelRoleName = "level";
const timezoneRole = "time zone";
const pronouns = ["name only/no pronoun", "they/them", "she/her", "he/him", "neopronoun"];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('updateuniform')
		.setDescription("Sends a button to update their uniform in the server. ")
        .setDefaultPermission(false)
        .addStringOption(option => 
            option.setName('description')
                .setDescription('The message to be sent with the reaction buttons')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The message channel')
            .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
            .setRequired(true)),
	async execute(interaction) {

        await interaction.deferReply({ ephemeral: false });

        const options = interaction.options;
        const channel = options.getChannel('channel');
        var row = new MessageActionRow();
        const description = options.getString('description');
        const guildId = interaction.channel.guild.id;
        const role = options.getRole('role_to_check');

        row.addComponents(
            new MessageButton()
                .setCustomId(`updateuniform`)
                .setLabel('Update Uniform')
                .setStyle('PRIMARY')
                .setEmoji('839867958422798436'),
        );
        await channel.send({ content: description, components: [row] });
        await interaction.followUp({ content: "Message sent!"});
	},
    async executeButton(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guild = interaction.client.guilds.cache.get(guildId);
        const member = interaction.member;
        const memberInMainServer = guild.members.cache.find(u => u.id === member.user.id);
        const username = `${member.user.username}#${member.user.discriminator}`;
        const rolesToAdd = [];
        const rolesToRemove = [];

        const getRolesToUpdate = async (roleName) => {
            const roleToCheckName = memberInMainServer.roles.cache.find(r => r.name.toLowerCase().includes(roleName)).name;
            console.log(roleToCheckName);
            const roleToRemoveId = member.roles.cache.find(r => r.name.toLowerCase().includes(roleName)).id;
            const roleToAddId = interaction.guild.roles.cache.find(r => r.name === roleToCheckName).id;
    
            if (member.roles.cache.has(roleToAddId)){
                return interaction.followUp({ ephemeral: true, content: `You already have the ${roleMention(roleToAddId)} role`});
            }
            if (roleToRemoveId) {
                rolesToRemove.push(roleToRemoveId);
            }
            rolesToAdd.push(roleToAddId);
        }
        
        const getPronouns = async () => {
            const rolePronounsNames = memberInMainServer.roles.cache.filter(r => pronouns.includes(r.name.toLowerCase())).map(r => r.name);
            const rolesToRemoveIds = member.roles.cache.filter(r => pronouns.includes(r.name.toLowerCase()) &&!rolePronounsNames.includes(r.name.toLowerCase())).map(r => r.id);
            console.log(rolePronounsNames);
            rolePronounsNames.forEach(roleName => {
                const roleToAddId = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName).id;
                if (member.roles.cache.has(roleToAddId)){
                    return interaction.followUp({ ephemeral: true, content: `You already have the ${roleMention(roleToAddId)} role`});
                }
                rolesToAdd.push(roleToAddId);
            })
            if (rolesToRemoveIds) {
                console.log(rolesToRemoveIds);
                rolesToRemoveIds.forEach( rId => { rolesToRemove.push(rId)})
            }
        }
        
        getRolesToUpdate(levelRoleName);
        getRolesToUpdate(timezoneRole);
        getPronouns();
        
        await member.roles.add(rolesToAdd);
        if (rolesToRemove.length) {
            await member.roles.remove(rolesToRemove);
        }
        console.log(`${username} updated their level, timezone and pronouns in ${interaction.guild.name}`);
        interaction.followUp({ ephemeral: true, content: `I added you the ${rolesToAdd} roles`});
    }
};