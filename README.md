# BangPD Bot

Bang PD is a bot used in Bangtan Academy.

## Features

- Dictionary lookup
- Bookmark a message
- Role management
- Guild information
- Setting a reminder

## Development

### Set-up

- Follow https://discordjs.guide/preparations/ to set up your workspace
- Install VScode, or your favorite IDE flavor, to edit the bot.

### Testing

- Follow https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot to set up a Discord developer account and how to invite your bot to the server.
- Modify `config.json` with your bot credentials.
- Run `npm install` to install node packages
- Run `npm run dev` to start the bot. This will automatically listen to any changes you made without needed to restart the bot.

### Deployment

- Zip the entire directory.
- Obtain credentials to the EC2 instance stored in `.pem` file
- Execute `scp -i [YOUR-PEM-FILE] [LOCATION OF YOUR ZIP] [USER]@[Public IPv4 address of your EC2 instance]:[Location you want to send the file to]`
- Unzip the files and go to the folder that contains your bot logic
- Run `forever -o out.log -e err.log start index.js` to start the bot.
- To stop it, run `forever stop index.js`

## Commands

Commands all start with `/` and will give you tool-tips if you start typing in Discord.

- 📘 [Dictionary Commands](#-dictionary-commands)
- ⚙️ [Role Management Commands](#%EF%B8%8F-role-management-commands)
- ℹ️ [Information Request Commands](#ℹ%EF%B8%8F-information-request-commands)
- 📅 [Reminder Command](#-reminder-command)

<br/>

### 📘 Dictionary Commands

| Command                                       | Description                                                                                |
|-----------------------------------------------| ------------------------------------------------------------------------------------------ |
| [`/examples <word>`](#-examples)              | Search the dictionary for example sentences for a word.                                    |
| [`/hanja <word>`](#-hanja)                    | Search for Hanja in English, Korean, or Hanja itself.                                      |
| [`/papago <text> [language_codes]`](#-papago) | Translate text using Papago. Defaults to English. Optional: Translate to another language. |
| [`/word <word>`](#-word)                      | Search the dictionary for a word.                                                          |

#### <font size=3>⚡ /examples</font>

**Example:** `/examples 눈`

- **Options:** `<word>` _(string)_ Required
- **Permissions:** None

Returns an embedded message with a list of example sentences in Korean that include the `<word>`.

Adds a 🔖 reaction to bookmark the result.

#### <font size=3>⚡ /hanja</font>

**Example:** `/hanja 雪`

- **Options:** `<word>` _(string)_ Required
- **Permissions:** None<br/>

Searches the hanja database for meanings of hanjas and related words that occur in the provided `<word>`. Scans the word and returns an embedded message with all relevant results including meaning of single hanjas as well as related words.

Users can use buttons to browse through multiple pages of results.

Adds a 🔖 reaction to bookmark the result.

#### <font size=3>⚡ /papago</font>

**Example:** `/papago 눈이 오고 있다 ko>zh-CN`

- **Options:** `<text>` _(string)_ Required, `[language_codes]` _(source>target)_ Optional
- **Permissions:** None

Uses Papago's Neural Machine Translation to translate a `<text>` between two given languages. Translates from Korean to English by default, but users can specify source and target language.<br/>

Adds a 🔖 reaction to bookmark the result.<br/>

> The available language codes are: <br/><br/>
> `ko` (Korean), `en` (English), `zh-CN` (Chinese), `zh-TW` (Taiwanese), `es` (Spanish), `fr` (French), `vi` (Vietnamese), `th` (Thai), `id` (Indonesian), and `ja` (Japanese).<br/>

When entering `[language_codes]` the available combinations are:
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

#### <font size=3>⚡ /word</font>

**Example:** `/word 눈`

- **Options:** `<word>` _(string)_ Required
- **Permissions:** None

Performs a dictionary search for a given `<word>`. Results are returned in an embedded message which includes the word-type and the meanings of the word both in English and in Korean.

Users can use buttons to switch the language of the meanings.

Adds a 🔖 reaction to bookmark the result.

<br/>

### ⚙️ Role Management Commands

| Command                                                                                                             | Description                                                                                                           |
|---------------------------------------------------------------------------------------------------------------------| --------------------------------------------------------------------------------------------------------------------- |
| [`/addpermissions <role> <command>`](#-addpermissions)                                                              | Give permission to user(s) with role to use command.                                                                  |
| [`/addrole <role> <file_url>`](#-addrole)                                                                           | Give role to user(s) in the linked csv/txt file.                                                                      |
| [`/addrolestouserinmessage <message_ids> <channel> <role>`](#-addrolestouserinmessage)                              | Give role to user(s) mentioned in message(s).                                                                         |
| [`/temp-role <deadline> <role_id> <file_url>`](#-temp-role)                                                         | Give role to user(s) in the linked csv/txt file for a limited time.                                                   |
| [`/ccssgivetheapples <server_id> <message_ids> <channel_id> <first_role_id'> <second_role_id>`](#-ccssgivetheapples) | Gives role to user(s) mentioned in message(s) in satellite server. If they have first role, the second role is given. |
| [`/givetheapples <message_ids> <channel> <first_role> <second_role>`](#-givetheapples)                              | Gives role to user(s) mentioned in message(s). If they have first role, the second role is given.                     |
| [`/removepermissions <role> <command>`](#-removepermissions)                                                        | Remove permission from user(s) with role to use command.                                                              |
| [`/removerole <role> <file_url>`](#-removerole)                                                                     | Remove role from user(s) in the linked csv/txt file.                                                                  |
| [`/removerolestouserinmessage <message_ids> <channel> <role>`](#-removerolestouserinmessage)                        | Remove role from user(s) mentioned in message(s).                                                                     |
| [`/role_in <base_role> <assigned_role>`](#-role_in)                                                                 | Give role to all users with another role.                                                                             |
| [`/role_rin <base_role> <assigned_role>`](#-role_rin)                                                               | Remove role from all users with another role.                                                                         |
| [`/rollcall <role_exception_ids> <rollcall_role_id>`](#-rollcall)                                                   | Starts roll call.                                                                                                     |

#### <font size=3>⚡ /addpermissions</font>

**Example:** `/addpermissions @Moderator givetheapples`

- **Options:** `<role>` *(@role)* Required, `<command>` *(string)* Required
- **Permissions:** MANAGE_ROLES

Gives all users with the `<role>` provided the permission to use the command with the command name from `<command>`.

The `<command>` must match the exact command name of a current slash command, including any spaces and letter-casing (i.e. ✅ addpermissions, ❌ add Permissions )

#### <font size=3>⚡ /addrole</font>

**Example:** `/addrole @Moderator http://url`

- **Options:** `<role>` *(@role)* Required, `<file_url>` *(string)* Optional
- **Permissions:** MANAGE_ROLES, MANAGE_CHANNELS

Gives all users listed in the csv/txt file the `<role>` provided.

> The usernames in the txt/csv file must be the unique username that includes the numbers at the end and separated by a new line.
>
> ```
> ✅ minyoongi#0309
> ❌ minyoongi
> ❌ SUGA 🎹 슈가
> ```

Slash commands currently do not support file attachments, so attaching the file will not work. The `file_url` is technically optional, but until file attachments are supported, this command won't work as expected without a `file_url`. Please upload the file before using the command, and grab the file url using the `get file url` message context menu command.

#### <font size=3>⚡ /addrolestouserinmessage</font>

**Example:** `/addrolestouserinmessage 1234567812345678 #signup @ClassRole`

- **Options:** `<message_id>` *(string)* Required, `<channel>` *(@channel)* Required, `<role>` *(@role)* Required
- **Permissions:** MANAGE_ROLES

Assigns the `<role>` provided to all the users tagged in a message in a specific channel. This command works for messages in chats and threads.

Returns a response, per message, with a `.txt` attachment named `usersID.txt`, which includes a list of the ids from the mentioned users who had the `<role>` added.

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

#### <font size=3>⚡ /temp-role</font>

**Example:** `/temp-role 2023-06-13 00:00 @Moderator http://url`

- **Options:** `<deadline>` *(string)* Required, `<role>` *(@role)* Required, `<file_url>` *(string)* Required
- **Permissions:** MANAGE_ROLES, MANAGE_CHANNELS

Temporarily gives all users listed in the csv/txt file the `<role>` provided.

When entering the <deadline> the format should be in CT (America/Chicago) timezone and in YYYY-MM-DD HH:MM format. It may not be a date time that has already passed. With the 2-digit month, 2-digit day, and time in 24-hour format.
   - ✅ 2022-06-13 22:00
   - ❌ 2022-6-13 10:00 PM
   - ❌ 6-13-2022 10:00

Slash commands currently do not support file attachments, so attaching the file will not work. Please upload the file before using the command, and grab the file url using the `get file url` message context menu command. 

#### <font size=3>⚡ /ccssgivetheapples</font>

**Example:** `/ccssgivetheapples 1234567812345678 1234567812345678 1234567812345678 1234567812345678 1234567812345678`

- **Options:** `<server_id>` *(string)* Required, `<message_ids>` *(string)* Required, `<channel_id>` *(string)* Required, `<first_role_id>` *(string)* Required, `<file_url>` *(string)* Required, `<second_role_id>` *(string)* Required
- **Permissions:** MANAGE_ROLES

Gives role to user(s) mentioned in message(s) in the satellite server. If they have first role, the second role is given.

All options must be in their string ID format since you will not be able to directly access the `<role>` or `<channel>` objects of the satellite server.

#### <font size=3>⚡ /givetheapples</font>

**Example:** `/givetheapples 1234567812345678 #class-n-club-logbook @🍏 @🍎`

- **Options:** `<message_ids>` *(string)* Required, `<channel_id>` *(string)* Required, `<first_role_id>` *(string)* Required, `<file_url>` *(string)* Required, `<second_role_id>` *(string)* Required
- **Permissions:** MANAGE_ROLES

Gives role to user(s) mentioned in message(s). If they have first role, the second role is given.

This command is mainly for giving apples, but can technically work for any 2 roles.

#### <font size=3>⚡ /removepermissions</font>

**Example:** `/removepermissions @Moderator givetheapples`

- **Options:** `<role>` *(@role)* Required, `<command>` *(string)* Required
- **Permissions:** MANAGE_ROLES

Removes permissions for all users with the `<role>` provided to use the command with the command name from `<command>`.

The `<command>` must match the exact command name of a current slash command, including any spaces and letter-casing (i.e. ✅ removepermissions, ❌ remove Permissions )

#### <font size=3>⚡ /removerole</font>

**Example:** `/removerole @Moderator http://url`

- **Options:** `<role>` *(@role)* Required, `<file_url>` *(string)* Optional
- **Permissions:** MANAGE_ROLES, MANAGE_CHANNELS

Remove the `<role>` provided from all users listed in the csv/txt file.<br/>

> The usernames in the txt/csv file must be the unique username that includes the numbers at the end and separated by a new line.
>
> ```
> ✅ minyoongi#0309
> ❌ minyoongi
> ❌ SUGA 🎹 슈가
> ```

Slash commands currently do not support file attachments, so attaching the file will not work. The `file_url` is technically optional, but until file attachments are supported, this command won't work as expected without a `file_url`. Please upload the file before using the command, and grab the file url using the `get file url` message context menu command.

#### <font size=3>⚡ /removerolestouserinmessage</font>

**Example:** `/removerolestouserinmessage 1234567812345678 #signup @ClassRole`

- **Options:** `<message_id>` *(string)* Required, `<channel>` *(@channel)* Required, `<role>` *(@role)* Required
- **Permissions:** MANAGE_ROLES

Removes the `<role>` provided from all the users tagged in a message in a specific channel. This command works for messages in chats and threads.

Returns a response, per message, with a `.txt` attachment named `usersID.txt`, which includes a list of the ids from the mentioned users who had the `<role>` removed.

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

#### <font size=3>⚡ /role_in</font>

**Example:** `/role_in @ClassRole @ClassAlumniRole`

- **Options:** `<base_role>` *(@role)* Required, `<assigned_role>` *(@role)* Required
- **Permissions:** MANAGE_ROLES

Gives the `<assigned_role>` provided to all the users who currently have the `<base_role>`.

Returns a response with a `.txt` attachment named `usersID.txt`, which includes a list of the ids for the users who had the `<role>` added.

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

#### <font size=3>⚡ /role_rin</font>

**Example:** `/role_rin @ClassAlumniRole @ClassRole`

- **Options:** `<base_role>` *(@role)* Required, `<assigned_role>` *(@role)* Required
- **Permissions:** MANAGE_ROLES

Removes the `<assigned_role>` provided from all the users who currently have the `<base_role>`.

Returns a response with a `.txt` attachment named `usersID.txt`, which includes a list of the ids for the users who had the `<role>` removed.

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

#### <font size=3>⚡ /rollcall</font>

**Example:** `/rollcall 1234567812345678 @RollCall`

- **Options:** `<role_exception_ids>` *(string)* Required, `<rollcall_role_id>` *(@role)* Required
- **Permissions:** MANAGE_ROLES, MANAGE_CHANNELS

Starts rollcall. Users with the roles provided in `<role_exception_ids>` will not have the rollcall role (`<rollcall_role_id>`) added.

When entering multiple `<role_exception_ids>` they should be entered with a space between each one: `12345678XXXXXXXX 12345678XXXXXXXX`.

<br/>

### ℹ️ Information Request Commands

| Command                                                                    | Description                                                             |
|----------------------------------------------------------------------------| ----------------------------------------------------------------------- |
| [`/areactivestudents <message_ids> <channel> <role>`](#-areactivestudents) | Get active student status for user(s) in message(s).                    |
| [`/getfilelink <message_id> <channel>`](#-getfilelink)                     | Get the link to a message attachment.                                   |
| [`/getreactions <message_id> <channel>`](#-getreactions)                   | Get all reactions to a message.                                         |
| [`/getuserids <message_ids> <channel>`](#-getuserids)                      | Get a list of user ids for user(s) mentioned in message(s).             |
| [`/getusernames <file_url>`](#-getusernames)                               | Get user nicknames and tags from user(s) in the linked csv/txt file.    |
| [`/getusersinserver <message_ids> <channel>`](#-getusersinserver)          | Get a list of users per BA server from user(s) mentioned in message(s). |
| [`/getstudentprofile <user>`](#-getstudentprofile)                         | Get all roles from a user in all BA servers.                            |

#### <font size=3>⚡ /areactivestudents</font>

**Example:** `/areactivestudents 12345677812345678 @ActiveStudent`

- **Options:** `<message_ids>` _(string)_ Required, `<channel>` _(@channel)_ Required, `<role>` _(@role)_ Required
- **Permissions:** MANAGE_MESSAGES

Gets all users mentioned in a single message or messages (`<message_ids>`) in a specific channel (`<channel>`) and checks if they have the active student role (`<role>`). 
Returns a response with a `.txt` attachment named `activeStudents.txt` which includes a list of the ids from the mentioned users who have the `<role>`.
Returns a second response with a `.txt` attachment named `notActiveStudents.txt` which includes a list of the ids from the mentioned users who do not have the `<role>`.

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

When entering multiple `<message_ids>` they should be entered with a space between each one: `12345678XXXXXXXX 12345678XXXXXXXX`.

#### <font size=3>⚡ /getfilelink</font>

**Example:** `/getfilelink 12345677812345678 #logbook-logging`

- **Options:** `<message_id>` _(string)_ Required, `<channel>` _(@channel)_ Required
- **Permissions:** None

Gets the file url from an attachment in a message (`<message_id>`) in a specific channel (`<channel>`).

Also available as a context menu command when right-clicking on a message, named `get file url`. Response from the context command is only viewable to the user who executes it.

#### <font size=3>⚡ /getreactions</font>

**Example:** `/getreactions 1234567812345678 #signup`

- **Options:** `<message_id>` _(string)_ Required, `<channel>` _(@channel)_ Required
- **Permissions:** MANAGE_CHANNELS, MANAGE_ROLES

Gets the emoji reactions to a message (`<message_id>`) in a specific channel (`<channel>`). 
Returns a response, per different emoji reaction, with a `.txt` attachment named `emoji_reactions.txt`, which includes a list of the ids for the user(s) who reacted with that emoji. 

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

Also available as a context menu command when right-clicking on a message, named `get reactions`. Response from the context command is only viewable to the user who executes it.

#### <font size=3>⚡ /getuserids</font>

**Example:** `/getuserids 1234567812345678 #volunteer`

- **Options:** `<message_ids>` _(string)_ Required, `<channel>` _(@channel)_ Required
- **Permissions:** None

Gets the ids for all users mentioned in a single message or messages (`<message_ids>`) in a specific channel (`<channel>`).
Returns a response with a `.txt` attachment named `userIDs.txt` which includes a list of the ids from the mentioned users who have the `<role>`.

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

When entering multiple `<message_ids>` they should be entered with a space between each one: `12345678XXXXXXXX 12345678XXXXXXXX`.

Also available as a context menu command when right-clicking on a message, named `get user ids`. Response from the context command is only viewable to the user who executes it.

#### <font size=3>⚡ /getusernames</font>

**Example:** `/getusernames http://url`

- **Options:** `<file_url>` _(string)_ Required
- **Permissions:** MANAGE_ROLES

Gets the user tags and guild nicknames for all user ids found in the attachment at the url provided (`<file_url>`).
The attachment must be a `.csv` or `.txt` file type.

Attachment at file link provided should be formatted with user ids separated by a new line and in the following format.
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

Returns a response with a `.txt` attachment named `userNames.txt` which includes a list of the user tags and guild nicknames.

> User tags and guild nicknames are separated by a space, each new pair is separated by a new line.
>
> ```
> kimnamjoon#0912 RM 🐨 김남준
> kimseokjin#1204 JIN 🐹 김석진
> minyoongi#0309 SUGA 🐱 민윤기
> junghoseok#0218 JHOPE 🐿 정호석 
> parkjimin#1013 JIMIN 🐥 박지민
> kimtaehyung#1230 V 🐻🐯 김태형
> jeonjungkook#0901 JK 🐰 전정국
> ```

Also available as a context menu command when right-clicking on a message with an attachment, named `get user names`. Response from the context command is only viewable to the user who executes it.

#### <font size=3>⚡ /getusersinserver</font>

**Example:** `/getusersinserver 1234567812345678 #class-n-club-logbook`

- **Options:** `<message_ids>` _(string)_ Required, `<channel>` _(@channel)_ Required
- **Permissions:** MANAGE_ROLES

Gets all users mentioned in a single message or messages (`<message_ids>`) in a specific channel (`<channel>`) and returns a response with user ids per BA server/server combination.<br/>

The possible server and combinations are: 
* All
* BAG only
* BAL only
* BAT only
* BAL and BAG
* BAL and BAT
* BAT and BAG

Returns a response, per server or server combination, with a `.txt` attachment named `userIDs.txt` which includes a list of the ids from the mentioned users who are in the server or server combination.

> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```

When entering multiple `<message_ids>` they should be entered with a space between each one: `12345678XXXXXXXX 12345678XXXXXXXX`.

Also available as a context menu command when right-clicking on a message, named `get user per server`. Response from the context command is only viewable to the user who executes it.

<br/>


#### <font size=3>⚡ /getstudentprofile</font>

**Example:** `/getstudentprofile @Bang PD Nim`

- **Options:** `<user>` _(user)_ Required

Get all roles from a user in all BA servers and returns a response with an embed with a list for each server.

<br/>

### 📅 Reminder Command

| Command                                                                                   | Description                                |
|-------------------------------------------------------------------------------------------| ------------------------------------------ |
| [`/setreminder <deadline> <channel> <time_in_advance> <reminder_message>`](#-setreminder) | Set a reminder message to send in channel. |

#### <font size=3>⚡ /setreminder</font>

**Example:** `/setreminder 2023-06-13 00:00 #volunteer 1d Volunteer applications will close in 24 hours`

- **Options:** `<deadline>` _(string)_ Required, `<channel>` _(@channel)_ Required, `<time_in_advance>` _(string @choice)_ Required, `<reminder_message>` _(string)_ Required
- **Permissions:** MANAGE_CHANNELS

Sends a message (`reminder_message>`) to the channel (`<channel>`) at a time in advance of a deadline (`<deadline>`).

When entering the `<deadline>` the format should be in CT (America/Chicago) timezone and in `YYYY-MM-DD HH:MM` format. It may not be a date time that has already passed. With the 2-digit month, 2-digit day, and time in 24-hour format.
   - ✅ 2022-06-13 22:00
   - ❌ 2022-6-13 10:00 PM
   - ❌ 6-13-2022 10:00

When entering the `<time_in_advance>` the three choices available are: 30 min, 1 hour, and 1 day in advance of the deadline.
