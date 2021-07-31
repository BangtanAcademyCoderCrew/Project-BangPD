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
        }
      ],
    });
  }

  run(message, { commandName }) {    
    const attachment = message.attachments.values().next().value;
    if (!attachment) {
        return message.reply("No valid file attached.")
    }
    console.log(commandName);
    removeCommand(commandName)

    setTimeout(function(){
        addCommand(attachment.url, commandName)
        return message.channel.send(`Added command ${commandName}`);
    }, 5000)


    function removeCommand(commandName) {
        const commands = fs.readdirSync(path.join(__dirname))
        console.log(commands);
        if (!commands.includes(`${commandName}.js`)) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}! A new command will be created.`);

        try {
            fs.unlinkSync(path.join(__dirname, `${commandName}.js`))
            console.log("REMOVED FILE");
            message.channel.send("Old command file has been removed.")
            //file removed
          } catch(err) {
            console.error(err)
        }
    }

    async function addCommand(url, fileName) {
        try {
            const response = await got(url);
            var commandFile = response.body;
            const filepath = `${__dirname}/${fileName}.js`
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