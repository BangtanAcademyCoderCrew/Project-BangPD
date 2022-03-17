const DiscordUtil = require('../../common/discordutil.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Adds a role to user(s). Attach a csv or txt file with a list of all the usernames, one per line')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role you would like to add to user(s).')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('file_url')
        .setDescription('The url of the csv/txt with list of users, one per line')
    )
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const role = options.getRole('role');
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
      member.roles.add([role.id]);
    };

    DiscordUtil.openFileAndDo(attachmentURL, addMemberRole, interaction);
    interaction.reply({ content: `The role ${role} has been added` });
  },
};
