const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const DiscordUtil = require('../../common/discordutil.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('givetheapples')
    .setDescription('Assigns a role to users mentioned in a message. If they have the 1st role, the 2nd role is assigned')
    .addStringOption(option => option.setName('message_ids')
      .setDescription('What messages would you like to get the user ids from?')
      .setRequired(true))
    .addChannelOption(option => option.setName('channel')
      .setDescription('In what channel is this message?')
      .addChannelTypes([ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread])
      .setRequired(true))
    .addRoleOption(option => option.setName('first_role')
      .setDescription('What role would you like to add to user?')
      .setRequired(true))
    .addRoleOption(option => option.setName('second_role')
      .setDescription('What role would you like to add to user if they have the first role?')
      .setRequired(true))
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const messageIds = options.getString('message_ids');
    const channel = options.getChannel('channel');
    const firstRoleToAssign = options.getRole('first_role');
    const secondRoleToAssign = options.getRole('second_role');

    await interaction.deferReply();

    const assignRoles = (messageId, firstRole, secondRole) => {
      channel.messages.fetch(messageId).then(msg => {
        if (msg.reactions.cache.get('👍') && msg.reactions.cache.get('👍').me) {
          return interaction.followUp({ content: 'You already checked this message before!' });
        }
        const ids = msg.mentions.users.map(user => user.id);
        const members = interaction.guild.members.cache.filter(member => ids.includes(member.id));
        const bothRoles = [firstRole.id, secondRole.id];
        let usersWithFirstRole = '';
        let usersWithSecondRole = '';

        // Counts number of times a user appears in ids
        const userFrequency = {};
        for (let i = 0; i < ids.length; i++) {
          userFrequency[ids[i]] = userFrequency[ids[i]] ? userFrequency[ids[i]] + 1 : 1;
        }

        // Adds roles based on userFrequency counts
        members.forEach((member) => {
          if (userFrequency[member.id] >= 2 && usersWithFirstRole.indexOf(member.id) === -1) {
            member.roles.add(bothRoles);
            usersWithFirstRole += `<@${member.id}>\n`;
            usersWithSecondRole += `<@${member.id}>\n`;
          } else if (!member.roles.cache.has(firstRole.id)) {
            member.roles.add([firstRole.id]);
            usersWithFirstRole += `<@${member.id}>\n`;
          } else {
            member.roles.add([secondRole.id]);
            usersWithSecondRole += `<@${member.id}>\n`;
          }
        });

        // Creates attachments and sends txt files with userIds
        const attachmentFirstRole = new MessageAttachment(Buffer.from(usersWithFirstRole, 'utf-8'), 'usersID-firstRole.txt');
        const attachmentSecondRole = new MessageAttachment(Buffer.from(usersWithSecondRole, 'utf-8'), 'usersID-secondRole.txt');
        // Creates embeds with userIds and sends them

        const firstRoleEmbed = DiscordUtil.createApplesAssignEmbed('Green Apple', usersWithFirstRole);
        const secondRoleEmbed = DiscordUtil.createApplesAssignEmbed('Red Apple', usersWithSecondRole);
        interaction.followUp({ content: `Users in message ${messageId} added role ${firstRole} and ${secondRole}`, files: [attachmentFirstRole, attachmentSecondRole], embeds: [firstRoleEmbed, secondRoleEmbed] });
        msg.react('👍');
      }).catch((error) => {
        console.error(error);
        interaction.followUp({ content: `Message with ID ${messageId} wasn't found in channel <#${channel.id}> <a:shookysad:949689086665437184>` });
      });
    };

    const allMessageIDs = messageIds.split(' ');
    allMessageIDs.forEach(messageId => assignRoles(messageId, firstRoleToAssign, secondRoleToAssign));
  }
};