import { MessageAttachment } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('givetheapples')
    .setDescription('Assigns a role to users mentioned in a message. If they have the first role, the second role is assigned.')
    .addStringOption(option => option.setName('messageIds')
      .setDescription('What messages would you like to get the user ids from?')
      .setRequired(true))
    .addChannelOption(option => option.setName('channel')
      .setDescription('In what channel is this message?')
      .setRequired(true))
    .addRoleOption(option => option.setName('firstRoleId')
      .setDescription('What role would you like to add to user?')
      .setRequired(true))
    .addRoleOption(option => option.setName('secondRoleId')
      .setDescription('What role would you like to add to user if they have the first role?')
      .setRequired(true))
    .addStringOption(option => option.setName('serverId')
      .setDescription('In what server is this message?')),
  async execute(interaction) {
    const options = interaction.options;
    const messageIds = options.getString('messageIds');
    const serverId = options.getString('serverId');
    const channel = options.getChannel('channel');
    const firstRoleIdToAssign = options.getRole('firstRoleId');
    const secondRoleIdToAssign = options.getRole('secondRoleId');

    // This likely doesn't work, can't access other guilds from an interaction rn. It might work if we make this a global command.
    // If we can't get this to work by just using the interaction, we can probably use the REST calls
    const guild = interaction.message.client.guilds.cache.get(serverId);
    if (serverId && !guild) {
      return message.reply(`I can't find server with ID ${serverId} :pensive:`);
    }

    const guildChannel = guild.channels.cache.get(channel.id);
    if (!guildChannel) {
      return message.reply(`I can't find channel with ID ${channel.id} in server ${guild.name} :pensive:`);
    }

    const allMessageIDs = messageIds.split(' ');
    allMessageIDs.forEach(messageId => assignRoles(messageId, firstRoleIdToAssign, secondRoleIdToAssign));

    const countInArray = (array, element) => {
      return array.filter(item => item == element).length;
    };

    const assignRoles = (messageId, firstRoleId, secondRoleId) => {
      guildChannel.messages.fetch(messageId).then(msg => {
        if (msg.reactions.cache.get('👍') && msg.reactions.cache.get('👍').me) {
          return interaction.reply("You already checked this message before!");
        }
        const content = msg.content.replace(/\D/g, " ").split(" ");
        const ids = content.filter(e => e.length >= 16);
        const members = interaction.guild.members.cache.filter(member => ids.includes(member.id));
        const bothRoles = [firstRoleId, secondRoleId];
        console.log(ids);
        console.log(ids.length);
        const usersWithFirstRole = [];
        const usersWithSecondRole = [];

        // Counts number of times a user appears in ids
        const userFrequency = {};
        for (let i = 0; i < ids.length; i++) {
          userFrequency[ids[i]] = userFrequency[ids[i]] ? userFrequency[ids[i]] + 1 : 1;
        }

        // Adds roles based on userFrequency counts
        for (let i = 0; i < ids.length; i++) {
          const member = members[i];
          console.log(member.id);
          if (userFrequency[member.id] >= 2 && countInArray(usersWithFirstRole, member.id) == 0) {
            member.roles.add(bothRoles);
            usersWithFirstRole.push(member);
            usersWithSecondRole.push(member);
          } else if (!member.roles.cache.has(firstRoleId)) {
            member.roles.add([firstRoleId]);
            usersWithFirstRole.push(member);
          } else {
            member.roles.add([secondRoleId]);
            usersWithSecondRole.push(member);
          }
        }

        // Creates attachments and sents txt files with userIds
        const attachmentFirstRole = new MessageAttachment(Buffer.from(`${usersWithFirstRole.join("\n")}`, 'utf-8'), 'usersID-firstRole.txt');
        interaction.channel.send(`Users in message ${messageId} added role ${firstRoleId}`, attachmentFirstRole);
        const attachmentSecondRole = new MessageAttachment(Buffer.from(`${usersWithSecondRole.join("\n")}`, 'utf-8'), 'usersID-secondRole.txt');
        interaction.channel.send(`Users in message ${messageId} added role ${secondRoleId}`, attachmentSecondRole);
      }).catch((error) => {
        console.error(error);
        interaction.channel.send(`Message with ID ${messageId} wasn't found in channel <#${channel.id}>`);
      });
    };
  }
}
