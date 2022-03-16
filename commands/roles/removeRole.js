const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Removes a role from user(s). Attach a csv or txt file with a list usernames, one per line')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The rol you would like to remove from user(s)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('file_url')
        .setDescription('The url of the csv/txt with list of users, one per line')
    )
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const roleId = options.getRole('role').id;
    const fileUrl = options.getString('file_url');
    const attachment = interaction.attachments?.values()?.next()?.value;

    await interaction.deferReply();

    let attachmentURL;
    if (!attachment && fileUrl) {
      attachmentURL = fileUrl;
    }
    else if (attachment) {
      attachmentURL = attachment.url;
    }
    else {
      return interaction.reply({ content: 'No valid file' });
    }

    const addMemberRole = (member) => {
      member.roles.remove([roleId]);
    };

    DiscordUtil.openFileAndDo(attachmentURL, addMemberRole, interaction);
    interaction.reply({ content: 'Removed roles to users in file' });
  },
};
