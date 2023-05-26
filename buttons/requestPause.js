const { guildId } = require('../config.json');
const { greenAppleRoleId, activeStudentRoleId, pausedStudentRoleId } = require('./buttonsConfig.json');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: 'requestPause',
    /**
     *
     * @param { ButtonInteraction } interaction
     * @param { GuildMember } member
     */
    async run(interaction, member) {
        await interaction.deferReply({ ephemeral: true });

        const isStudentPaused = member.roles.cache.has(pausedStudentRoleId);
        if (isStudentPaused) {
            await interaction.followUp({ content: 'You are already paused!', ephemeral: true });
            return;
        }

        const guildMain = interaction.client.guilds.cache.get(guildId);
        const memberInBA = guildMain.members.cache.find(m => m.id === interaction.member.id);
        const memberHasGreenApple = memberInBA.roles.cache.has(greenAppleRoleId);
        const memberIsActiveStudent = memberInBA.roles.cache.has(activeStudentRoleId);

        if (memberHasGreenApple || memberIsActiveStudent) {

            const { targetId } = interaction;
            const options = [];

            for (let i = 3; i < 7; i++) {
                const option = {
                    label: `${i} Weeks`,
                    value: `${i}`
                };
                options.push(option);
            }

            const row = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId(`requestPause_${targetId}`)
                    .setPlaceholder('Select the number of weeks to pause')
                    .addOptions(options)
            );

            await interaction.followUp({ content: ' ', components: [row] });
            return;
        }

        await interaction.followUp({ content: 'Oops! You need the Active Student role or at least ONE apple 🍏 to pause :pensive:', ephemeral: true });
    }
};