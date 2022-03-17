const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const got = require('got');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updatecommand')
    .setDescription('Updates a command')
    .addStringOption(option =>
      option.setName('command_name')
        .setDescription('The name of the command to update')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('command_group')
        .setDescription('The group this command is in')
        .setRequired(true))
    .setDefaultPermission(false),
  async execute(interaction) {
    const options = interaction.options;
    const commandName = options.getString('command_name');
    const commandGroup = options.getString('command_group');
    const attachment = interaction.attachments.values().next().value;

    await interaction.deferReply();

    if (!attachment) {
      return interaction.reply({ content: 'No valid file attached.' });
    }
    const folderPath = `${'./ : ', path.resolve('./')}/commands/${commandGroup}`;


    const removeCommand = async (name, filePath) => {
      const commands = fs.readdirSync(filePath);
      console.log(commands);
      if (!commands.includes(`${name}.js`)) {
        return interaction.reply({
          content: `There is no command with name or alias \`${name}\`, ${interaction.author}! A new command will be created.`
        });
      }

      try {
        fs.unlinkSync(`${folderPath}/${commandName}.js`);
        console.log('REMOVED FILE');
        interaction.reply({ content: 'Old command file has been removed.' });
      } catch (error) {
        console.error(error);
      }
    };

    const addCommand = async (url, fileName, folder) => {
      try {
        const response = await got(url);
        const commandFile = response.body;
        const filepath = `${folder}/${fileName}.js`;
        console.log(filepath);

        fs.writeFile(filepath, commandFile, (error) => {
          if (error) {
            throw error;
          }
          console.log('Results Received');
        });
      } catch (error) {
        console.log(error);
      }
    };

    await removeCommand(commandName, folderPath);

    setTimeout(() => {
      addCommand(attachment.url, commandName, folderPath);
      return interaction.followUp({ content: `Added command ${commandName}` });
    }, 5000);
  }
};