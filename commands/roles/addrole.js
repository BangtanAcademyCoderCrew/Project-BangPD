const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

// TODO: needs permissions 'MANAGE_CHANNELS', 'MANAGE_ROLES'
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Adds a role to user(s)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role you would like to add to user(s). Attach a csv or txt file with a list of all the usernames, one per line')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('file_url')
                .setDescription('The url of the csv/txt with list of users, one per line')
        ),
    async execute(interaction) {
        const options = interaction.options;
        const roleId = options.getRole('role').id;
        const fileUrl = options.getString('file_url');
        const attachment = interaction.attachments.values().next().value;

        let attachmentURL;
        if (!attachment && fileUrl) {
          attachmentURL = fileUrl;
        }
        if (attachment) {
            attachmentURL = attachment.url;
        }
        else {
          return interaction.reply({ content: 'No valid file' });
        }

        const addMemberRole = (member) => {
            member.roles.add([roleId]);
        };

        DiscordUtil.openFileAndDo(attachmentURL, addMemberRole, interaction);
    },
};
