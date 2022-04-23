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


## Commands

Commands all start with `/` and will give you tool-tips if you start typing in Discord.

### Dictionary

| Command                            | Description                                                                                | Example                   |
|------------------------------------|--------------------------------------------------------------------------------------------|---------------------------|
| `/examples <word>`                 | Search the dictionary for example sentences for a word.                                    | `/examples 눈`             |
| `/hanja <word>`                    | Search for Hanja in English, Korean, or Hanja itself.                                      | `/hanja 雪`                |
| `/papago <text> [language_codes]`  | Translate text using Papago. Defaults to English. Optional: Translate to another language. | `/papago 눈이 오고 있다 zh-CN`|
| `/word <word>`                     | Search the dictionary for a word.                                                          | `/word 눈`                 |

### Role Management

| Command                                                                                       | Description                                                                                                           | Example                                                                                                    |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `/addpermissions <role> <command>`                                                            | Give permission to user(s) with role to use command.                                                                  | `/addpermissions @Moderator giveTheApples`                                                                 |
| `/addrole <role> <file_url>`                                                                  | Give role to user(s) in the linked csv/txt file.                                                                      | `/addrole @Moderator http://url`                                                                           |
| `/addrolestouserinmessage <message_ids> <channel> <role>`                                     | Give role to user(s) mentioned in message(s).                                                                         | `/addrolestouserinmessage 1234567812345678 #signup @ClassRole`                                             |
| `/temp-role <deadline> <role_id> <file_url>`                                                  | Give role to user(s) in the linked csv/txt file for a limited time.                                                   | `/temp-role 2023-06-13 00:00 @Moderator http://url`                                                        |
| `/ccssgivetheapples <server_id> <message_ids> <channel_id> <first_role_id'> <second_role_id>` | Gives role to user(s) mentioned in message(s) in satellite server. If they have first role, the second role is given. | `/ccssgivetheapples 1234567812345678 1234567812345678 1234567812345678 1234567812345678 1234567812345678`  |
| `/givetheapples <message_ids> <channel> <first_role'> <second_role>`                          | Gives role to user(s) mentioned in message(s). If they have first role, the second role is given.                     | `/givetheapples 1234567812345678 #class-n-club-logbook @🍏 @🍎`                                            |
| `/removepermissions <role> <command>`                                                         | Remove permission from user(s) with role to use command.                                                              | `/removepermissions @Moderator giveTheApples`                                                              |
| `/removerole <role> <file_url>`                                                               | Remove role from user(s) in the linked csv/txt file.                                                                  | `/removerole @Moderator http://url`                                                                        |
| `/removerolestouserinmessage <message_ids> <channel> <role>`                                  | Remove role from user(s) mentioned in message(s).                                                                     | `/removerolestouserinmessage 1234567812345678 #signup @ClassRole`                                          |
| `/role_in <base_role> <assigned_role>`                                                        | Give role to all users with another role.                                                                             | `/role_in @ClassRole @ClassAlumniRole`                                                                     |
| `/role_rin <base_role> <assigned_role>`                                                       | Remove role from all users with another role.                                                                         | `/role_in @ClassAlumniRole @ClassRole`                                                                     |
| `/rollcall <role_exception_ids> <rollcall_role_id>`                                           | Starts roll call.                                                                                                     | `/rollcall 1234567812345678 @RollCall`                                                                     |

### Information Request

| Command                                             | Description                                                              | Example                                                    |
|-----------------------------------------------------|--------------------------------------------------------------------------|------------------------------------------------------------|
| `/areactivestudents <message_ids> <channel> <role>` | Get active student status for user(s) in message(s).                     | `/areactivestudents 12345677812345678 @ActiveStudent`      |
| `/getfilelink <message_id> <channel>`               | Get the link to a message attachment.                                    | `/getfilelink 12345677812345678 #logbook-logging`          |
| `/getreactions <message_id> <channel>`              | Get all reactions to a message.                                          | `/getreactions 1234567812345678 #signup`                   |
| `/getuserids <message_ids> <channel>`               | Get a list of user ids for user(s) mentioned in message(s).              | `/getuserids 1234567812345678 #volunteer`                  |
| `/getusernames <file_url>`                          | Get user nicknames and tags from user(s) in the linked csv/txt file.     | `/getusernames http://url`                                 |
| `/getusersinserver <message_ids> <channel>`         | Get a list of users per BA server from user(s) mentioned in message(s).  | `/getusersinserver 1234567812345678 #class-n-club-logbook` |

### Reminders

| Command                                                                  | Description                                | Example                                                                                     |
|--------------------------------------------------------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------|
| `/setreminder <deadline> <channel> <time_in_advance> <reminder_message>` | Set a reminder message to send in channel. | `/setreminder 2023-06-13 00:00 #volunteer 1d Volunteer applications will close in 24 hours` |
