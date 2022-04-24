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

- Follow https://discordjs.guide/preparations/ to set up your workspace
- Install VScode to edit the bot.

### Bot testing

- Follow https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot to set up a Discord developer account and how to invite your bot to the server.
- Modify **config.json** with your bot credentials.
- Run **npm run dev** to start the bot. This will automatically listen to any changes you made without needed to restart the bot.

### Deployment

- Zip the entire directory.
- Obtain credentials to the EC2 instance stored in .pem file
- Execute **scp -i [YOUR-PEM-FILE] [LOCATION OF YOUR ZIP] [USER]@[Public IPv4 address of your EC2 instance]:[Location you want to send the file to]**
- Unzip the files and go to the folder that contains your bot logic
- Run **forever -o out.log -e err.log start index.js** to start the bot.
- To stop it, run **forever stop index.js**

## Commands

Commands all start with `/` and will give you tool-tips if you start typing in Discord.

### 📘 Dictionary

| Command                           | Description                                                                                | Example                           |
| --------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------- |
| `/examples <word>`                | Search the dictionary for example sentences for a word.                                    | `/examples 눈`                    |
| `/hanja <word>`                   | Search for Hanja in English, Korean, or Hanja itself.                                      | `/hanja 雪`                       |
| `/papago <text> [language_codes]` | Translate text using Papago. Defaults to English. Optional: Translate to another language. | `/papago 눈이 오고 있다 ko>zh-CN` |
| `/word <word>`                    | Search the dictionary for a word.                                                          | `/word 눈`                        |

#### `/examples`

**Options:**<br/>
`<word>` _(string)_ Required

**Description:**<br/>
Returns an embedded message with a list of example sentences in Korean that include the `<word>`.<br/>

- Adds a 🔖 reaction to bookmark the result.

**Permissions:**<br/>
None

#### `/hanja`

**Options:**<br/>
`<word>` _(string)_ Required

**Description:**<br/>
Searches the hanja database for meanings of hanjas and related words that occur in the provided `<word>`.<br/>
Scans the word and returns an embedded message with all relevant results including meaning of single hanjas as well as related words.<br/>

- Users can use buttons to browse through multiple pages of results.<br/>
- Adds a 🔖 reaction to bookmark the result.

**Permissions:**<br/>
None

#### `/papago`

**Options:**<br/>
`<text>` _(string)_ Required<br/>
`[language_codes]` _(source>target)_ Optional

**Description:**<br/>
Uses Papago's Neural Machine Translation to translate a `<text>` between two given languages.<br/>
Translates from Korean to English by default, but users can specify source and target language.<br/>

- Adds a 🔖 reaction to bookmark the result.<br/>
- The available language codes are: `ko` (Korean), `en` (English), `zh-CN` (Chinese), `zh-TW` (Taiwanese), `es` (Spanish), `fr` (French), `vi` (Vietnamese), `th` (Thai), `id` (Indonesian), and `ja` (Japanese).<br/>
- The available `[language_codes]` combinations are:
  - `ko>en`
  - `ko>zh-CN`
  - `ko>zh-TW`
  - `ko>es`
  - `ko>fr`
  - `ko>vi`
  - `ko>th`
  - `ko>id`
  - `ko>ja`
  - `en>ja`
  - `en>fr`

**Permissions:**<br/>
None

#### `/word`

**Options:**<br/>
`<word>` _(string)_ Required

**Description:**<br/>
Performs a dictionary search for a given `<word>`.<br/>
Results are returned in an embedded message and include the word-type and the meanings of the word both in English and in Korean.<br/>

- Users can use buttons to switch the language of the meanings.<br/>
- Adds a 🔖 reaction to bookmark the result.

**Permissions:**<br/>
None

### ⚙️ Role Management

| Command                                                                                       | Description                                                                                                           | Example                                                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/addpermissions <role> <command>`                                                            | Give permission to user(s) with role to use command.                                                                  | `/addpermissions @Moderator givetheapples`                                                                |
| `/addrole <role> <file_url>`                                                                  | Give role to user(s) in the linked csv/txt file.                                                                      | `/addrole @Moderator http://url`                                                                          |
| `/addrolestouserinmessage <message_ids> <channel> <role>`                                     | Give role to user(s) mentioned in message(s).                                                                         | `/addrolestouserinmessage 1234567812345678 #signup @ClassRole`                                            |
| `/temp-role <deadline> <role_id> <file_url>`                                                  | Give role to user(s) in the linked csv/txt file for a limited time.                                                   | `/temp-role 2023-06-13 00:00 @Moderator http://url`                                                       |
| `/ccssgivetheapples <server_id> <message_ids> <channel_id> <first_role_id'> <second_role_id>` | Gives role to user(s) mentioned in message(s) in satellite server. If they have first role, the second role is given. | `/ccssgivetheapples 1234567812345678 1234567812345678 1234567812345678 1234567812345678 1234567812345678` |
| `/givetheapples <message_ids> <channel> <first_role> <second_role>`                           | Gives role to user(s) mentioned in message(s). If they have first role, the second role is given.                     | `/givetheapples 1234567812345678 #class-n-club-logbook @🍏 @🍎`                                           |
| `/removepermissions <role> <command>`                                                         | Remove permission from user(s) with role to use command.                                                              | `/removepermissions @Moderator givetheapples`                                                             |
| `/removerole <role> <file_url>`                                                               | Remove role from user(s) in the linked csv/txt file.                                                                  | `/removerole @Moderator http://url`                                                                       |
| `/removerolestouserinmessage <message_ids> <channel> <role>`                                  | Remove role from user(s) mentioned in message(s).                                                                     | `/removerolestouserinmessage 1234567812345678 #signup @ClassRole`                                         |
| `/role_in <base_role> <assigned_role>`                                                        | Give role to all users with another role.                                                                             | `/role_in @ClassRole @ClassAlumniRole`                                                                    |
| `/role_rin <base_role> <assigned_role>`                                                       | Remove role from all users with another role.                                                                         | `/role_rin @ClassAlumniRole @ClassRole`                                                                   |
| `/rollcall <role_exception_ids> <rollcall_role_id>`                                           | Starts roll call.                                                                                                     | `/rollcall 1234567812345678 @RollCall`                                                                    |

<details>
<summary>/addpermissions</summary>
  
> **Options:**<br/>
> `<role>` *(@role)* Required<br/>
> `<file_url>` *(string)* Required
>
> **Description:**<br/>
> Gives all users with the `<role>` provided the permission to use the command with the command name from `<command>`.<br/>
>
> - The `<command>` must match the exact command name of a current slash command, including any spaces and letter-casing (i.e. ✅ addpermissions, ❌ add Permissions )
>
> **Permissions:** MANAGE_ROLES
</details>

<details>
<summary>/addrole</summary>
  
> **Options:**<br/>
> `<role>` *(@role)* Required<br/>
> `<file_url>` *(string)* Optional
>
> **Description:**<br/>
> Gives all users listed in the csv/txt file the `<role>` provided.<br/>
>
> - The usernames in the txt/csv file must be the unique username that includes the numbers at the end
>   - ✅ minyoongi#0309
>   - ❌ minyoongi
>   - ❌ SUGA 🎹 슈가)
> - Slash commands currently do not support file attachments, so attaching the file will not work. The `file_url` is technically optional, but until file attachments are supported, this command won't work as expected without a `file_url`. Please upload the file before using the command, and grab the file url using the `get file url` menu command. 
>
> **Permissions:** MANAGE_ROLES and MANAGE_CHANNELS
</details>

<details>
<summary>/addrolestouserinmessage</summary>
  
> **Options:**<br/>
> `<message_id>` *(string)* Required<br/>
> `<role>` *(@role)* Required
>
> **Description:**<br/>
> Assigns the `<role>` provided to all the users tagged in a message. This command works for messages in chats and threads.<br/>
>
> **Permissions:** MANAGE_ROLES
</details>

<details>
<summary>/temp-role</summary>
  
> **Options:**<br/>
> `<deadline>` *(string)* Required, Format: YYYY-MM-DD HH:MM<br/>
> `<role_id>` *(@role)* Required<br/>
> `<file_url>` *(string)* Required
>
> **Description:**<br/>
> Temporarily gives all users listed in the csv/txt file the `<role>` provided.<br/>
>
> - The deadline must be in YYYY-MM-DD HH:MM format. The month must be 2 digits, time in 24 hour format.
>   - ✅ 2022-06-13 22:00
>   - ❌ 2022-6-13 10:00 PM
>   - ❌ 6-13-2022 10:00
> - Slash commands currently do not support file attachments, so attaching the file will not work. Please upload the file before using the command, and grab the file url using the `get file url` menu command. 
>
> **Permissions:** MANAGE_ROLES and MANAGE_CHANNELS
</details>

<details>
<summary>/ccssgivetheapples </summary>
  
> **Options:**<br/>
> `<server_id>` *(string)* Required<br/>
> `<message_ids>` *(string)* Required<br/>
> `<channel_id>` *(string)* Required<br/>
> `<first_role_id>` *(string)* Required<br/>
> `<second_role_id>` *(string)* Required
>
> **Description:**<br/>
> Gives role to user(s) mentioned in message(s) in the satellite server. If they have first role, the second role is given.<br/>
>
> - All options must be in their string ID format since you will not be able to directly access the `<role>` or `<channel>` objects of the satellite server.
>
> **Permissions:** MANAGE_ROLES
</details>

<details>
<summary>/givetheapples </summary>
  
> **Options:**<br/>
> `<message_ids>` *(string)* Required<br/>
> `<channel>` *(@channel)* Required<br/>
> `<first_role>` *(@role)* Required<br/>
> `<second_role>` *(@role)* Required
>
> **Description:**<br/>
> Gives role to user(s) mentioned in message(s). If they have first role, the second role is given.<br/>
>
> - This command is mainly for giving apples, but can technically work for any 2 roles.
>
> **Permissions:** MANAGE_ROLES
</details>

### ℹ️ Information Request

| Command                                             | Description                                                             | Example                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `/areactivestudents <message_ids> <channel> <role>` | Get active student status for user(s) in message(s).                    | `/areactivestudents 12345677812345678 @ActiveStudent`      |
| `/getfilelink <message_id> <channel>`               | Get the link to a message attachment.                                   | `/getfilelink 12345677812345678 #logbook-logging`          |
| `/getreactions <message_id> <channel>`              | Get all reactions to a message.                                         | `/getreactions 1234567812345678 #signup`                   |
| `/getuserids <message_ids> <channel>`               | Get a list of user ids for user(s) mentioned in message(s).             | `/getuserids 1234567812345678 #volunteer`                  |
| `/getusernames <file_url>`                          | Get user nicknames and tags from user(s) in the linked csv/txt file.    | `/getusernames http://url`                                 |
| `/getusersinserver <message_ids> <channel>`         | Get a list of users per BA server from user(s) mentioned in message(s). | `/getusersinserver 1234567812345678 #class-n-club-logbook` |

#### `/areactivestudents`

**Options:**<br/>
`<message_ids>` _(string)_ Required<br/>
`<channel>` _(@channel)_ Required<br/>
`<role>` _(@role)_ Required

**Description:**<br/>
Gets all users mentioned in a single message or messages by `<message_ids>` in a specific channel provided in `<channel>` and checks if they have the active student role provided in `<role>`.<br/>
Returns a response with a `.txt` attachment named `activeStudents` which includes a list of the ids from the mentioned users who have the `<role>`.<br/>
Returns a second response with a `.txt` attachment named `notActiveStudents` which includes a list of the ids from the mentioned users who do not have the `<role>`.<br/>

- When entering multiple `<message_ids>` they should be entered with a space between each one: `1234567812345678 1234567812345678`.

**Permissions:**<br/>
MANAGE_MESSAGES

### 📅 Reminders

| Command                                                                  | Description                                | Example                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `/setreminder <deadline> <channel> <time_in_advance> <reminder_message>` | Set a reminder message to send in channel. | `/setreminder 2023-06-13 00:00 #volunteer 1d Volunteer applications will close in 24 hours` |

#### `/setreminder`

**Options:**<br/>
`<deadline>` _(string)_ Required<br/>
`<channel>` _(@channel)_ Required<br/>
`<time_in_advance>` _(string @choice)_ Required<br/>
`<reminder_message>` _(string)_ Required

**Description:**<br/>
Sends a message (`reminder_message>`) to a the specified channel (`<channel>`) at a specific time in advance from a deadline (`<deadline>`) provided.<br/>

- When entering the `<deadline>` the format should be CT (America/Chicago) in `YYYY-MM-DD HH:MM` format. It may not be a date time that has already passed.<br/>
- When entering the `<time_in_advance>` the three choices provided are: 30 min, 1 hour, and 1 day in advance of the deadline.

**Permissions:**<br/>
MANAGE_CHANNELS
