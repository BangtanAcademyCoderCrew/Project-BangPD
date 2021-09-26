const { Command } = require("discord.js-commando");
const fs = require('fs');
const path = require('path')
const got = require('got');

module.exports = class RemoveRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: "updatecommand",
      group: "miscellaneous",
      memberName: "updatecommand",
      description: "Updates a command.",
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
      args: [
        {
          key: "commandName",
          prompt: "What's the command name?",
          type: "string",
        },
        {
          key: "commandGroup",
          prompt: "What's the command group?",
          type: "string",
        }
      ],
    });
  }

  run(message, { commandName, commandGroup }) {    
    const attachment = message.attachments.values().next().value;
    if (!attachment) {
        return message.reply("No valid file attached.")
    }
    const folderPath = `${"./ : ", path.resolve("./")}/commands/${commandGroup}`;
    removeCommand(commandName, folderPath)

    setTimeout(function(){
        addCommand(attachment.url, commandName, folderPath)
        return message.channel.send(`Added command ${commandName}`);
    }, 5000)


    function removeCommand(commandName, folderPath) {
        const commands = fs.readdirSync(folderPath);
        console.log(commands);
        if (!commands.includes(`${commandName}.js`)) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}! A new command will be created.`);

        try {
            fs.unlinkSync(`${folderPath}/${commandName}.js`)
            console.log("REMOVED FILE");
            message.channel.send("Old command file has been removed.")
            //file removed
          } catch(err) {
            console.error(err)
        }
    }

    async function addCommand(url, fileName, folderPath) {
        try {
            const response = await got(url);
            var commandFile = response.body;
            const filepath = `${folderPath}/${fileName}.js`
            console.log(filepath);
    
            fs.writeFile(filepath, commandFile, function (err) {
                if (err) throw err;
                console.log('Results Received');
            });

        } catch (error) {
            console.log(error);
        }
    }
  }
};