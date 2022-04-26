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


### 📘 Dictionary Commands

| Command                                      | Description                                                                                | Example                           |
|----------------------------------------------| ------------------------------------------------------------------------------------------ | --------------------------------- |
| [`/examples <word>`](#examples)              | Search the dictionary for example sentences for a word.                                    | `/examples 눈`                    |
| [`/hanja <word>`](#hanja)                    | Search for Hanja in English, Korean, or Hanja itself.                                      | `/hanja 雪`                       |
| [`/papago <text> [language_codes]`](#papago) | Translate text using Papago. Defaults to English. Optional: Translate to another language. | `/papago 눈이 오고 있다 ko>zh-CN` |
| [`/word <word>`](#word)                      | Search the dictionary for a word.                                                          | `/word 눈`                        |

<details>
<summary><a id=examples>/examples</a></summary>

- **Options:** `<word>` _(string)_ Required
- **Permissions:** None

Returns an embedded message with a list of example sentences in Korean that include the `<word>`.

Adds a 🔖 reaction to bookmark the result.
</details><br/>


<details>
<summary><a id=hanja>/hanja</a></summary>

- **Options:** `<word>` _(string)_ Required
- **Permissions:** None<br/>

Searches the hanja database for meanings of hanjas and related words that occur in the provided `<word>`. Scans the word and returns an embedded message with all relevant results including meaning of single hanjas as well as related words.

Users can use buttons to browse through multiple pages of results.

Adds a 🔖 reaction to bookmark the result.
</details><br/>


<details>
<summary><a id=papago>/papago</a></summary>

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
</details><br/>


<details>
<summary><a id=word>/word</a></summary>

- **Options:** `<word>` _(string)_ Required
- **Permissions:** None

Performs a dictionary search for a given `<word>`. Results are returned in an embedded message which includes the word-type and the meanings of the word both in English and in Korean.

Users can use buttons to switch the language of the meanings.

Adds a 🔖 reaction to bookmark the result.
</details><br/>

### ⚙️ Role Management Commands

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
> `<command>` *(string)* Required
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
> `<channel>` *(@channel)* Required<br/>
> `<role>` *(@role)* Required
>
> **Description:**<br/>
> Assigns the `<role>` provided to all the users tagged in a message in a specific channel. This command works for messages in chats and threads.<br/>
>
> Returns a response, per message, with a `.txt` attachment named `usersID.txt`, which includes a list of the ids from the mentioned users who had the `<role>` removed.
>
> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```
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

<details>
<summary>/removepermissions</summary>

> **Options:**<br/>
> `<role>` *(@role)* Required<br/>
> `<command>` *(string)* Required
>
> **Description:**<br/>
> Removes permissions for all users with the `<role>` provided to use the command with the command name from `<command>`.<br/>
>
> - The `<command>` must match the exact command name of a current slash command, including any spaces and letter-casing (i.e. ✅ removepermissions, ❌ remove Permissions )
>
> **Permissions:** MANAGE_ROLES
</details>

<details>
<summary>/removerole</summary>

> **Options:**<br/>
> `<role>` *(@role)* Required<br/>
> `<file_url>` *(string)* Optional
>
> **Description:**<br/>
> Remove the `<role>` provided from all users listed in the csv/txt file.<br/>
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
<summary>/removerolestouserinmessage</summary>

> **Options:**<br/>
> `<message_id>` *(string)* Required<br/>
> `<channel>` *(@channel)* Required<br/>
> `<role>` *(@role)* Required
>
> **Description:**<br/>
> Removes the `<role>` provided from all the users tagged in a message in a specific channel. This command works for messages in chats and threads.<br/>
>
> Returns a response, per message, with a `.txt` attachment named `usersID.txt`, which includes a list of the ids from the mentioned users who had the `<role>` removed.
>
> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```
> **Permissions:** MANAGE_ROLES
</details>

<details>
<summary>/role_in</summary>

> **Options:**<br/>
> `<base_role>` *(@role)* Required<br/>
> `<assigned_role>` *(@role)* Required<br/>
>
> **Description:**<br/>
> Gives the `<assigned_role>` provided to all the users who currently have the `<base_role>`.
>
> Returns a response with a `.txt` attachment named `usersID.txt`, which includes a list of the ids for the users who had the `<role>` added.
>
> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```
> **Permissions:** MANAGE_ROLES
</details>

<details>
<summary>/role_rin</summary>

> **Options:**<br/>
> `<base_role>` *(@role)* Required<br/>
> `<assigned_role>` *(@role)* Required<br/>
>
> **Description:**<br/>
> Removes the `<assigned_role>` provided from all the users who currently have the `<base_role>`.
>
> Returns a response with a `.txt` attachment named `usersID.txt`, which includes a list of the ids for the users who had the `<role>` removed.
>
> User ids are separated by a new line and in the following format.
>
> ```
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> <@12345678XXXXXXXX>
> ```
> **Permissions:** MANAGE_ROLES
</details>

<details>
<summary>/rollcall</summary>

> **Options:**<br/>
> `<role_exception_ids>` *(string)* Required<br/>
> `<rollcall_role_id>` *(@role)* Required<br/>
>
> **Description:**<br/>
> Starts rollcall. Users with the roles provided in `<role_exception_ids>` will not have the rollcall role (`<rollcall_role_id>`) added.
>
> When entering multiple `<role_exception_ids>` they should be entered with a space between each one: `12345678XXXXXXXX 12345678XXXXXXXX`.
>
> **Permissions:** MANAGE_CHANNELS, MANAGE_ROLES
</details>

### ℹ️ Information Request Commands

| Command                                             | Description                                                             | Example                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `/areactivestudents <message_ids> <channel> <role>` | Get active student status for user(s) in message(s).                    | `/areactivestudents 12345677812345678 @ActiveStudent`      |
| `/getfilelink <message_id> <channel>`               | Get the link to a message attachment.                                   | `/getfilelink 12345677812345678 #logbook-logging`          |
| `/getreactions <message_id> <channel>`              | Get all reactions to a message.                                         | `/getreactions 1234567812345678 #signup`                   |
| `/getuserids <message_ids> <channel>`               | Get a list of user ids for user(s) mentioned in message(s).             | `/getuserids 1234567812345678 #volunteer`                  |
| `/getusernames <file_url>`                          | Get user nicknames and tags from user(s) in the linked csv/txt file.    | `/getusernames http://url`                                 |
| `/getusersinserver <message_ids> <channel>`         | Get a list of users per BA server from user(s) mentioned in message(s). | `/getusersinserver 1234567812345678 #class-n-club-logbook` |


#### <font size=3>`/areactivestudents`</font>

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


#### <font size=3>`/getfilelink`</font>

- **Options:** `<message_id>` _(string)_ Required, `<channel>` _(@channel)_ Required
- **Permissions:** None

Gets the file url from an attachment in a message (`<message_id>`) in a specific channel (`<channel>`).

Also available as a context menu command when right-clicking on a message, named `get file url`. Response from the context command is only viewable to the user who executes it.


#### <font size=3>`/getreactions`</font>

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


#### <font size=3>`/getuserids`</font>

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


#### <font size=3>`/getusernames`</font>

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


#### <font size=3>`/getusersinserver`</font>

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


### 📅 Reminder Command

| Command                                                                  | Description                                | Example                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `/setreminder <deadline> <channel> <time_in_advance> <reminder_message>` | Set a reminder message to send in channel. | `/setreminder 2023-06-13 00:00 #volunteer 1d Volunteer applications will close in 24 hours` |

#### <font size=3>`/setreminder`</font>

- **Options:** `<deadline>` _(string)_ Required, `<channel>` _(@channel)_ Required, `<time_in_advance>` _(string @choice)_ Required, `<reminder_message>` _(string)_ Required
- **Permissions:** MANAGE_CHANNELS

Sends a message (`reminder_message>`) to the channel (`<channel>`) at a time in advance of a deadline (`<deadline>`).

When entering the `<deadline>` the format should be in CT (America/Chicago) timezone and in `YYYY-MM-DD HH:MM` format. It may not be a date time that has already passed. With the 2-digit month, 2-digit day, and time in 24-hour format.
   - ✅ 2022-06-13 22:00
   - ❌ 2022-6-13 10:00 PM
   - ❌ 6-13-2022 10:00

When entering the `<time_in_advance>` the three choices available are: 30 min, 1 hour, and 1 day in advance of the deadline.
