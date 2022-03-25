const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ccssgivetheapples')
    .setDescription('Assigns a role to users mentioned in a message. If they have the 1st role, the 2nd role is assigned')
    .addStringOption(option => option.setName('server_id')
      .setDescription('In what server is this message?')
      .setRequired(true))
    .addStringOption(option => option.setName('message_ids')
      .setDescription('What messages would you like to get the user ids from?')
      .setRequired(true))
    .addStringOption(option => option.setName('channel_id')
      .setDescription('In what channel is this message?')
      .setRequired(true))
    .addStringOption(option => option.setName('first_role_id')
      .setDescription('What role would you like to add to user?')
      .setRequired(true))
    .addStringOption(option => option.setName('second_role_id')
      .setDescription('What role would you like to add to user if they have the first role?')
      .setRequired(true))
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const messageIds = options.getString('message_ids');
    const channelId = options.getString('channel_id');
    const firstRoleToAssignId = options.getString('first_role_id');
    const secondRoleToAssignId = options.getString('second_role_id');
    const serverId = options.getString('server_id');

    await interaction.deferReply();

    const guild = interaction.client.guilds.cache.get(serverId);
    if (serverId && !guild) {
      return interaction.reply({ content:`I can't find server with ID ${serverId} :pensive:` });
    }

    const guildChannel = guild.channels.cache.get(channelId);
    if (!guildChannel) {
      return interaction.reply({ content:`I can't find channel with ID ${channelId} in server ${guild.name} :pensive:` });
    }

    const assignRoles = (messageId, firstRole, secondRole) => {
      guildChannel.messages.fetch(messageId).then(msg => {
        if (msg.reactions.cache.get('👍') && msg.reactions.cache.get('👍').me) {
          return interaction.followUp('You already checked this message before!');
        }
        const content = msg.content.replace(/\D/g, ' ').split(' ');
        const ids = content.filter(e => e.length >= 16);
        const members = interaction.guild.members.cache.filter(member => ids.includes(member.id));
        const bothRoles = [firstRole, secondRole];
        console.log(ids);
        console.log(ids.length);
        let usersWithFirstRole = '';
        let usersWithSecondRole = '';

        // Counts number of times a user appears in ids
        const userFrequency = {};
        for (let i = 0; i < ids.length; i++) {
          userFrequency[ids[i]] = userFrequency[ids[i]] ? userFrequency[ids[i]] + 1 : 1;
        }

        // Adds roles based on userFrequency counts
        members.forEach((member) => {
          console.log(member.id);
          if (userFrequency[member.id] >= 2 && usersWithFirstRole.indexOf(member.id) === -1) {
            member.roles.add(bothRoles);
            usersWithFirstRole += `<@${member.id}>\n`;
            usersWithSecondRole += `<@${member.id}>\n`;
          } else if (!member.roles.cache.has(firstRole)) {
            member.roles.add([firstRole]);
            usersWithFirstRole += `<@${member.id}>\n`;
          } else {
            member.roles.add([secondRole]);
            usersWithSecondRole += `<@${member.id}>\n`;
          }
        });

        // Creates attachments and sends txt files with userIds
        const attachmentFirstRole = new MessageAttachment(Buffer.from(usersWithFirstRole, 'utf-8'), 'usersID-firstRole.txt');
        const attachmentSecondRole = new MessageAttachment(Buffer.from(usersWithSecondRole, 'utf-8'), 'usersID-secondRole.txt');
        interaction.followUp({ content: `Users in message ${messageId} added role ${firstRole} and ${secondRole}`, files: [attachmentFirstRole, attachmentSecondRole] });
        msg.react('👍');
      }).catch((error) => {
        console.error(error);
        interaction.followUp(`Message with ID ${messageId} wasn't found in channel <#${channelId}> <a:shookysad:949689086665437184>`);
      });
    };

    const allMessageIDs = messageIds.split(' ');
    allMessageIDs.forEach(messageId => assignRoles(messageId, firstRoleToAssignId, secondRoleToAssignId));
  }
};