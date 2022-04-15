const cron = require('node-cron');
const Promise = require('promise');
const { fetchAllMessagesByChannel } = require('../common/discordutil');

const logbookChannelNameStem = 'class-n-club-logbook';

// TODO: need to get the apple role ids for BA server
const firstRoleId = '';
const secondRoleId = '';


module.exports = {
  name: 'giveApples',
  async start(client) {
    // running job at 02:00 at America/Chicago timezone
    cron.schedule('0 2 * * *', async () => {
      // gather logbook channels
      const logbookChannels = client.channels.cache.filter(c => c.name.toLowerCase().includes(logbookChannelNameStem));
      const userIdsInLogbook = [];
      const membersNeedingApples = [];
      const messagesWithAppliesApplied = [];

      const addAppleRoles = () => {
        const bothRoles = [firstRoleId, secondRoleId];

        // Counts number of times a user appears in ids
        const userFrequency = {};
        for (let i = 0; i < userIdsInLogbook.length; i++) {
          userFrequency[userIdsInLogbook[i]] = userFrequency[userIdsInLogbook[i]] ? userFrequency[userIdsInLogbook[i]] + 1 : 1;
        }

        // Adds roles based on userFrequency counts
        membersNeedingApples.forEach((member) => {
          if (userFrequency[member.id] >= 2) {
            member.roles.add(bothRoles);
          } else if (!member.roles.cache.has(firstRoleId)) {
            member.roles.add([firstRoleId]);
          } else {
            member.roles.add([secondRoleId]);
          }
        });
      };

      if (logbookChannels) {
        // TODO: refactor to work across multiple guilds

        // gather all messages with reactions from logbook channels
        Promise.all(logbookChannels.map(async channel => {
          await fetchAllMessagesByChannel(channel).then(messages => {
            return messages.map(m => {
              if (m.reactions.cache.get('👍') && m.reactions.cache.get('👍').me) {
                return;
              }

              // TODO: can we use mentions across different servers?
              const content = m.content.replace(/\D/g, ' ').split(' ');
              const ids = content.filter(e => e.length >= 16);

              const usersInMessage = m.client.users.cache.filter(u => ids.includes(u.id));
              usersInMessage.map(user => userIdsInLogbook.push(user.id));

              const members = m.client.members.cache.filter(member => userIdsInLogbook.includes(member.id));
              members.map(mm => membersNeedingApples.push(mm));

              if (usersInMessage.size > 0) {
                messagesWithAppliesApplied.push(m);
              }
            });
          });
        })).then(() => {

          // assign the apples
          addAppleRoles();

          // mark message as completed
          messagesWithAppliesApplied.forEach(msg => {
            msg.react('👍');
          });

          // TODO: apple job dump to some channel for cider army
        });
      }
    }, {
      scheduled: true,
        timezone: 'America/Chicago'
    });
  }
};