# BangPD Bot
Bang PD is a bot used in Bangtan Academy.

## Features
- Setting a reminder
- Dictionary lookup
- Bookmark

### Setting a reminder
TODO: Add instructions how to run the function.

### Dictionary Lookup
#### Word Definition
Look up the definition of the Korean word.

#### Hanja
Search for Hanja in English, Korean, or Hanja itself.

#### Sentence Examples
Search the dictionary for example sentences with the given Korean word.

#### Papago Translation
Translate a text using Papago.

### Bookmark
Bookmarks a message on Discord by reacting to the message with the bookmark emoji.


## Development
### Set-up
* Follow https://discordjs.guide/preparations/ to set up your workspace
* Install VScode to edit the bot.

### Bot testing
* Follow https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot to set up a Discord developer account and how to invite your bot to the server.
* Modify **config.json** with your bot credentials.
* Run **npm run dev** to start the bot. This will automatically listen to any changes you made without needed to restart the bot.

### Deployment
* Zip the entire directory.
* Obtain credentials to the EC2 instance stored in .pem file
* Execute **scp -i [YOUR-PEM-FILE] [LOCATION OF YOUR ZIP] [USER]@[Public IPv4 address of your EC2 instance]:[Location you want to send the file to]**
* Unzip the files and go to the folder that contains your bot logic
* Run **forever -o out.log -e err.log start index.js** to start the bot.
* To stop it, run **forever stop index.js**
