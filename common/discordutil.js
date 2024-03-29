const { Collection, MessageEmbed, MessageAttachment } = require('discord.js');
const langs = require('./langs.js');
const { DateTime } = require('luxon');
const got = require('got');
const Promise = require('promise');
const { guildId, BATId, BALId, BAGId, BADId, BAEId, prefix, accentColor, avatar } = require('../config.json');
const ALL_GUILD_IDS = [guildId, BATId, BALId, BAGId, BADId, BAEId];
const GUILD_IDS_WITHOUT_BAE = [guildId, BATId, BALId, BAGId, BADId];
const SATELLITE_GUILD_IDS_WITHOUT_BAE = [BATId, BALId, BAGId, BADId];
const msgLimit = 2000;

module.exports = {
  bookmark(message, user) {
    if (!user.dmChannel) {
      user.createDM();
    }

    const attachment = message.attachments.first();
    let image;
    if (attachment && (attachment.width || attachment.height)) {
      image = attachment.url;
    }

    if (!image && !message.content) {
      if (message.embeds[0]) {
        const embed = message.embeds[0];
        user.send(`Sent by: ${message.author.username}`, { embed }).then(msg => msg.react('❌'));
        return;
      }
    }

    if (message.content.length >= 2048) {
      const splittedText = this.splitText(message.content);
      this.createBookMarkMessage(message, splittedText[0], image, user);
      this.createBookMarkMessage(message, splittedText[1], image, user);
    } else {
      this.createBookMarkMessage(message, message.content, image, user);
    }
  },
  createBookMarkMessage(message, text, image, user) {
    const author = {
      name: message.author.username,
      iconURL: message.author.avatarURL
    };
    const embed = new MessageEmbed()
        .setColor(0xDF2B40)
        .setAuthor(author)
        .setDescription(`${text}${image ? `\r\n\r\n${image}` : ''} \r\n\r\n **Message link:** ${message.url}`)
        .setImage(image)
        .setTimestamp(message.editedTimestamp || message.createdTimestamp);

    user.send({ embeds: [embed] }).then(msg => msg.react('❌'));
  },

  createBasicEmbed(name) {
    const author = {
      name: name || 'BangPD',
      iconURL: 'https://i.imgur.com/UwOpFvr.png'
    };

    return new MessageEmbed()
        .setColor(accentColor)
        .setAuthor(author);
  },

  setEmbedFooter(embed, footer) {
    const footerData = {
      text: footer,
      iconURL: avatar
    };
    embed.setFooter(footerData);
  },

  createPendingEmbed(username) {
    return this.createBasicEmbed().setDescription(`I am going over the books for you ${username}, please wait. :eyes:`);
  },

  async sendGiveApplesEmbed(channel, title, description, fields = [], thumbnail = '') {
    if (!channel) {
      return;
    }

    const cst = 'America/Chicago';
    const author = {
      name: 'BangPD',
      iconURL: 'https://i.imgur.com/UwOpFvr.png'
    };
    const embed = new MessageEmbed()
        .setColor('#5445ff')
        .setAuthor(author)
        .setTitle(`Scheduled Job: giveApples ${title}`)
        .setDescription(description)
        .setFooter({
          text: `💜 ${DateTime.utc().setZone(cst).toLocaleString(DateTime.DATETIME_FULL)}`
        });

    if (thumbnail !== '') {
      embed.setThumbnail(thumbnail);
    }
    if (fields.length > 0) {
      embed.addFields(fields);
    }

    await channel.send({ embeds: [embed] });
  },

  createWordSearchEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      this.setEmbedFooter(embed, `${username} can toggle languages. ${!isDM ? 'Anyone can bookmark this message.' : ''}`);
      searchResults.forEach((entry) => {
        const defs = [];
        let j;
        if (entry.senses) {
          for (j = 0; j < entry.senses.length; j += 1) {
            const sense = entry.senses[j];
            let d;
            if (language === 'en') {
              d = `${j + 1}. __${sense.meaning}__\r\n${sense.translation}`;
            } else if (language === 'ko') {
              d = `${j + 1}. __${sense.meaning}__\r\n${sense.definition}`;
            }
            if (`${defs.join('\n')}\n${d}`.length < 1024) {
              defs.push(d);
            }
          }
        }
        if (language === 'en') {
          embed.addField(`**${entry.word}**${entry.hanja ? ` (${entry.hanja})` : ''} - ${entry.wordTypeTranslated}${entry.pronunciation ? ` - [${entry.pronunciation}]` : ''}${entry.stars > 0 ? '  ' + '★'.repeat(entry.stars) : ''}`, defs.join('\n'));
        } else if (language === 'ko') {
          embed.addField(`**${entry.word}**${entry.hanja ? ` (${entry.hanja})` : ''} - ${entry.wordType}${entry.pronunciation ? ` - [${entry.pronunciation}]` : ''}${entry.stars > 0 ? '  ' + '★'.repeat(entry.stars) : ''}`, defs.join('\n'));
        }
      });
    }
    return embed;
  },

  createHanjaEmbeds(query, username, isDM, results) {
    const pages = [];
    const isEmpty = results.similarwords.length === 0 && results.hanjas.length === 0;
    if (isEmpty) {
      const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
      embed.addField('Error', 'No results have been found');
      pages.push(embed);
    } else {
      const pageLength = 10;
      let counter = 0;
      while (results.hanjas.length > 0 || results.similarwords.length > 0) {
        const page = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
        let i;
        const hanjas = [];
        const words = [];
        for (i = 0; i < pageLength; i += 1) {
          if (results.hanjas.length > 0) {
            const hanja = results.hanjas.shift();
            hanjas.push(`${counter + 1}. **${hanja.hanja}**\r\n${hanja.definition}`);
            counter += 1;
          } else if (results.similarwords.length > 0) {
            const word = results.similarwords.shift();
            words.push(`${counter + 1}. **${word.hanja}** **(${word.hangul})**\r\n${word.english}`);
            counter += 1;
          }
        }

        if (hanjas.length > 0) {
          page.addField('Hanjas', hanjas.join('\r\n'));
        }
        if (words.length > 0) {
          page.addField('Related Words', words.join('\r\n'));
        }

        pages.push(page);
      }
    }
    const pageCount = pages.length;
    if (pageCount > 1) {
      pages.forEach((page) => {
        const author = {
          name: 'BangPD',
          iconURL: 'https://i.imgur.com/UwOpFvr.png'
        };
        page.setAuthor(author);
      });
    }
    return pages;
  },

  createExampleResultEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Example Sentences for for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      let s = `Example sentences for **${query}**:\r\n\r\n`;
      let i;
      for (i = 0; i < searchResults.length; i += 1) {
        s += `**${i + 1}.** ${searchResults[i].example.replace(query, `**__${query}__**`)}\r\n\r\n`;
      }
      embed.setDescription(s);
      if (!isDM) {
        this.setEmbedFooter(embed, 'Anyone can bookmark this message.');
      }
    }
    return embed;
  },

  createTranslationResultEmbed(result) {
    const embed = this.createBasicEmbed();
    this.setEmbedFooter(embed, 'Powered by Papago');
    if (!result) {
      embed.addField('Error', 'No results have been found');
    } else {
      embed.addField('Result', result.text);
      embed.addField('Original Language', langs[result.source], true);
      embed.addField('Target Language', langs[result.target], true);
      this.setEmbedFooter(embed, 'Anyone can bookmark this message.');
    }
    return embed;
  },

  createHelpEmbed(commands) {
    const embed = this.createBasicEmbed('BangPD').setDescription(`Use **${prefix}dictionary-help <command>** to see information about a specific command.`);
    commands.forEach((c) => {
      if (c.name === 'help') return;
      if (c.devOnly) return;
      const {
        name,
        aliases,
        description,
        examples
      } = c;

      const descriptionAndExamples = description + (examples ? `\r\n __(Ex. ${examples})__` : '');
      const title = `${prefix}${name} ${aliases ? `(short: ${aliases.map(e => prefix + e).join(', ')})` : ''}`;
      embed.addField(title, descriptionAndExamples);
    });
    return embed;
  },

  createDetailHelpEmbed(command) {
    const embed = this.createBasicEmbed().setDescription(`**${prefix}${command.name} ${command.aliases ? `(short: ${command.aliases.map(e => prefix + e).join(', ')})` : ''}**\r\n${command.details ? command.details : command.description}`);
    if (command.examples) {
      embed.addField('Usage Example', command.examples ? command.examples : 'None', true);
    }
    return embed;
  },

  createLoggingEmbed(message, color) {
    const cst = 'America/Chicago';
    const currentTimeUTC = DateTime.utc();
    const currentTimeCST = currentTimeUTC.setZone(cst);
    const footer = {
      text: `${currentTimeCST.toLocaleString(DateTime.DATETIME_FULL)}`
    };

    const embed = new MessageEmbed()
        .setColor(color)
        .setFooter(footer)
        .setDescription(message);

    return embed;
  },

  createApplesAssignEmbed(title, message) {
    return this.createBasicEmbed(title).setDescription(`${message}`);
  },

  getMemberByUsername(interaction, username) {
    const members = interaction.guild.members.cache;
    const user = interaction.client.users.cache.find(u => u.tag === username);
    if (!user) {
      return false;
    }
    const userId = user.id;
    return members.get(userId);
  },

  divideMessageWithUsernamesInParts(usernames, messageChannel) {
    for (let i = 0; i <= Math.ceil(usernames.length / 50); i++) {
      const list = usernames.slice(i * 50, i * 50 + 50).join('\n');
      if (i < 1) {
        messageChannel.send(list);
      } else if (list.length > 0) {
        messageChannel.send('cont.\n' + list);
      }
    }
    messageChannel.send('Done with changes');
  },

  openFileAndDo(url, callback, interaction) {
    (async () => {
      const usersChanged = [];
      try {
        const response = await got(url);
        const csv = response.body;

        const usernames = csv.trim().split(/\r?\n/);
        usernames.forEach(username => {
          const member = module.exports.getMemberByUsername(interaction, username.trim());
          if (!member) {
            return interaction.followUp({ content: `User ${username} not found` });
          }
          callback(member);
          usersChanged.push(username);
        });
      } catch (error) {
        console.log(error);
      }
      const attachment = new MessageAttachment(Buffer.from(`${usersChanged.join('\n')}`, 'utf-8'), 'changedusers.txt');
      interaction.followUp({ content: 'Changed users', files: [attachment] });
    })();
  },

  splitText(s, separator = ' ') {
    let middle = Math.floor(s.length / 2);
    const before = s.lastIndexOf(separator, middle);
    const after = s.indexOf(separator, middle + 1);

    if (before === -1 || (after !== -1 && middle - before >= after - middle)) {
      middle = after;
    } else {
      middle = before;
    }

    const s1 = s.substr(0, middle);
    const s2 = s.substr(middle + 1);

    return [s1, s2];
  },

  getAllGuilds(guildIds, interaction) {
    const guilds = [];
    guildIds.forEach(idGuild => {
      const guild = interaction.client.guilds.cache.get(idGuild);
      if (idGuild && !guild) {
        interaction.followUp({ content: `I can't find server with ID ${idGuild} <a:shookysad:949689086665437184>`, ephemeral: true });
      } else {
        guilds.push(guild);
      }
    });
    return guilds;
  },

  getMainGuildId() {
    return guildId;
  },

  getAllGuildIds() {
    return ALL_GUILD_IDS;
  },

  getGuildIdsWithoutBAE() {
    return GUILD_IDS_WITHOUT_BAE;
  },

  getSatelliteGuildIdsWithoutBAE() {
    return SATELLITE_GUILD_IDS_WITHOUT_BAE;
  },

  splitMessages(mentions) {
    const mentionMessages = [];
    while (mentions.length !== 0) {
      const end = mentions.substring(0, msgLimit).lastIndexOf('>');
      mentionMessages.push(mentions.substring(0, end + 1));
      mentions = mentions.substring(end + 1, mentions.length);
    }
    return mentionMessages;
  },

  async kickUsersOnServers(userIds, guilds) {
    let membersKicked = '';
    const errorUsersPerServer = {};
    guilds.forEach(guild => errorUsersPerServer[guild.id] = '');
    await Promise.all(userIds.map(async (id) => {
      let errorCount = 0;
      await Promise.all(guilds.map(async (guild) => {
        await guild.members.kick(id)
            .catch((error) => {
              console.log(error);
              errorCount += 1;
              errorUsersPerServer[guild.id] += `<@${id}>\n`;
            });
      }));
      if (errorCount !== guilds.length) {
        membersKicked += `<@${id}>\n`;
      }
    }));
    return [membersKicked, errorUsersPerServer];
  },

  async banUsersOnServers(userIds, guilds) {
    let membersBanned = '';
    const errorUsersPerServer = {};
    guilds.forEach(guild => errorUsersPerServer[guild.id] = '');
    await Promise.all(userIds.map(async (id) => {
      let errorCount = 0;
      await Promise.all(guilds.map(async (guild) => {
        await guild.members.ban(id)
            .catch((error) => {
              console.log(error);
              errorCount += 1;
              errorUsersPerServer[guild.id] += `<@${id}>\n`;
            });
      }));
      if (errorCount !== guilds.length) {
        membersBanned += `<@${id}>\n`;
      }
    }));
    return [membersBanned, errorUsersPerServer];
  },

  getUsersWithRoleFromServer(role, guild) {
    const ids = Array.from(guild.roles.cache.get(role.id).members.keys());
    return [ids, ids.map(id => `<@${id}>`).join(' ')];
  },

  async fetchAllMessagesByChannel(channel) {
    let messages = new Collection();
    // Create message pointer of most recent message because we can only get 100 at a time
    let message = await channel.messages
      .fetch({ limit: 1 })
      .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
    messages = messages.set(message.id, message);

    while (message) {
      await channel.messages
        .fetch({ limit: 100, before: message.id })
        .then(messagePage => {
          messages = messages.concat(messagePage);
          // Update message pointer to be last message in page of messages
          message = messagePage.size > 0 ? messagePage.at(messagePage.size - 1) : null;
        });
    }

    return messages;
  },

  async fetchAllMessagesByChannelSince(channel, sinceDateTime) {
    let messages = new Collection();
    // Create message pointer of most recent message because we can only get 100 at a time
    let message = await channel.messages
        .fetch({ limit: 1 })
        .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));
    messages = messages.set(message.id, message);

    while (message) {
      await channel.messages
          .fetch({ limit: 100, before: message.id })
          .then(messagePage => {
            const filteredByDate = messagePage.filter(m => m.createdTimestamp >= sinceDateTime);
            messages = messages.concat(filteredByDate);
            // Update message pointer to be last message in page of messages
            message = filteredByDate.size > 0 ? messagePage.at(messagePage.size - 1) : null;
          });
    }

    return messages;
  },

  batchItems(items, batchSize = 100) {
    const batchedItems = [];
    for (let i = 0; i < Math.ceil(items.length / batchSize); i++) {
      batchedItems[i] = items.slice(i * batchSize, (i + 1) * batchSize);
    }
    return batchedItems;
  },

  getUserTimezoneRole(member) {
    const timezoneRole = 'time zone';
    return member.roles.cache.find(r => r.name.toLowerCase().includes(timezoneRole)).name.toLowerCase();
  },

  getUserLevelRole(member) {
    const levelRoleName = 'level';
    return member.roles.cache.find(r => r.name.toLowerCase().includes(levelRoleName)).name.toLowerCase();
  },

  getUserPronounsRoles(member) {
    const pronounsRoles = ['name only/no pronoun', 'they/them', 'she/her', 'he/him', 'neopronoun'];
    return member.roles.cache.filter(r => pronounsRoles.includes(r.name.toLowerCase())).map(r => r.name.toLowerCase());
  },

  getUserPassportRoles(member) {
    const level = this.getUserLevelRole(member);
    const timezone = this.getUserTimezoneRole(member);
    const pronouns = this.getUserPronounsRoles(member);
    return [level, timezone].concat(pronouns);
  },

  assignRolesFromMainServer: function(guild, memberOnBA, memberInNewGuild) {

    const passportRoles = this.getUserPassportRoles(memberOnBA);

    const rolesToAddIds = guild.roles.cache.filter(r => passportRoles.includes(r.name.toLowerCase())).map(r => r.id);
    memberInNewGuild.roles.add(rolesToAddIds);
  },

  updatePassportRolesInSatelliteServer(newGuildId, newMember, roleType, newRole, client) {
    const newGuild = client.guilds.cache.get(newGuildId);
    if (!newGuild) {
      return;
    }
    const guildMember = newGuild.members.cache.find(u => u.id === newMember.id);
    if (!guildMember) {
      return;
    }

    let oldRole;
    if (roleType != 'pronouns') {
      oldRole = guildMember.roles.cache.find(r => r.name.toLowerCase().includes(roleType));

      if (!oldRole) {
        console.log(`User ${guildMember.displayName} doesn't have a ${roleType} role`);
        return;
      }
    }

    const newRoleInGuild = newGuild.roles.cache.find(r => r.name.toLowerCase() === newRole);

    if (!newRoleInGuild) {
      console.log(`There's no role named ${newRole} in ${newGuild.name}`);
      return;
    }
    guildMember.roles.add(newRoleInGuild.id);

    if (oldRole) {
      guildMember.roles.remove(oldRole.id);
    }
  },

  removePronounsRoleInSatelliteServer(newGuildId, newMember, removedRole, client) {
    const newGuild = client.guilds.cache.get(newGuildId);
    if (!newGuild) {
      return;
    }
    const guildMember = newGuild.members.cache.find(u => u.id === newMember.id);
    if (!guildMember) {
      return;
    }
    const userPronouns = this.getUserPronounsRoles(guildMember);
    if (!userPronouns.includes(removedRole)) {
      return;
    }

    const roleToRemove = newGuild.roles.cache.find(r => r.name.toLowerCase() === removedRole);
    guildMember.roles.remove(roleToRemove.id);
  }

};
