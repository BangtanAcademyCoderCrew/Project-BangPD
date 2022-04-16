const Discord = require('discord.js');
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const got = require('got');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('getMessageUserIds')
    .setType(3),
  async execute(interaction) {
    console.log('Debug -- interaction', interaction);
    const guildId = interaction.guildId;
    const attachment = interaction.attachments.first();

    await interaction.deferReply();

    const guild = interaction.client.guilds.cache.get(guildId);

    const userNicknamesAndTags = [];
    try {
      const response = await got(attachment.url);
      const csv = response.body;
      const userIds = csv.split(/\r?\n/).map(id => id.replace(/[^\d]/g, ''));
      const users = interaction.client.users.cache.filter(u => userIds.includes(u.id));
      const members = guild.members.cache.filter(m => userIds.includes(m.id));

      userIds.forEach(userId => {
        const foundUser = users.find(u => u.id === userId);
        if (!foundUser) {
          return interaction.followUp({ content: `User ${userId} not found <a:shookysad:949689086665437184>` });

        }
        const foundMember = members.find(m => m.id === userId);
        if (!foundMember) {
          return interaction.followUp({ content: `Member ${userId} not found in server <a:shookysad:949689086665437184>` });

        }
        const nicknameOrUserName = foundMember.displayName || foundUser.username;
        userNicknamesAndTags.push(`${nicknameOrUserName} ${foundUser.tag}`);
      });
    } catch (error) {
      console.log(error);
    }
    const response = new Discord.MessageAttachment(Buffer.from(`${userNicknamesAndTags.join('\n')}`, 'utf-8'), 'userNames.txt');
    return interaction.followUp({ content: 'User(s) nicknames and tags', files: [response] });
  }
};
