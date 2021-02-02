<img src="https://github.com/Telefonica/msteams-private-messages/workflows/.github/workflows/test.yaml/badge.svg?branch=main">[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# msteams-private-messages

> Send private messages programmatically in MSTeams

<p align="center">
  <img src="icon.png">
</p>

This is a NodeJs service exposing:
 - A messaging endpoint which routes to a [MSTeams bot application](https://docs.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots)
 - Additional HTTP endpoints for triggering private notifications to users on demand.

***

**Table of contents**

1. [Our Use Case 🎯](#our-use-case)
2. [API 🎨](#api)
3. [Configuration 🏗](#configuration)
4. [Azure ☁️](#azure)
5. [Local Development 🖥](#local-development)
6. [FAQ 🙋‍♀️](#faq)
7. [Additional Doc 📚](#doc)

***

<a id="our-use-case">

## Our Use Case 🎯

We used to have Slack as communication platform. When an event occur in our infra, we used to send private messages (as well as public ones) to interested people. When migrating to MSTeams, we loosed this.

### Our solution

![main-diagram](doc/main-diagram.png)

We've implemented a MSTeams Bot that allows us to interact with users through text and cards while exposing a regular HTTP API.

 - `msteams-private-messages` is a web service.
 - This web service is registered on Azure as a [Bot Channel](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-4.0)
 - As conversational bot, when a user starts a conversation, the service saves a reference to that conversation as well as the name of the user.
 - The bot offers the user a menu of topics to subscribe, if the user subscribes to any of those, the service saves the relation `user-topics`.
 - The web service exposes a regular API able to:
    1. `notify` a message to an specific user (we need that user to have started a conversation with the bot in first place)
    2. `broadcast` a message related to a topic to every user subscribed to the topic

***

<a id="api">

## API 🎨

### Summary

|                                       |      endpoint       | method |               body               |
| :------------------------------------ | :------------------ | :----- | :------------------------------- |
| Server Info                           | `/`                 | `GET`  | ---                              |
| Private notification to user          | `/api/v1/notify`    | `POST` | `{username*, message*, mention}` |
| Broadcast notification to subscribers | `/api/v1/broadcast` | `POST` | `{topic*, message*, mention}`    |
| Bot-SDK entry-point                   | `/api/v1/messages`  | `POST` | _used by Bot-SDK_                |

### Private notification to user

```
POST /api/v1/notify
```

#### Parameters

|     Name     | Required |           Type           |                Description                 |
| :----------- | :------- | :----------------------- | :----------------------------------------- |
| **username** | Required | `string`                 | Name of the recipient for the notification |
| **message**  | Required | `string` or _`ICard`_    | The notification                           |
| mention      | Optional | `boolean`                | Append a mention to the user (@user)       |

```typescript
interface ICard {
  title: string;
  text: string;
}
```

#### Examples

```bash
curl -H "content-type: application/json"\
 -d '{"username": "Jane Doe", "message": "hi there"}'\
 localhost:3978/api/v1/notify
```

```bash
curl -H "content-type: application/json"\
 -d '{"username": "Jane Doe", "message": {"text": "this is the text", "title": "this is the title"}}'\
 localhost:3978/api/v1/notify
```

```bash
curl -H "content-type: application/json"\
 -d '{"username": "Jane Doe", "message": "hi there", "mention": true}'\
 localhost:3978/api/v1/notify
```

### Broadcast notification to subscribers

```
POST /api/v1/broadcast
```

#### Parameters

|    Name     | Required |           Type           |                                     Description                                      |
| :---------- | :------- | :----------------------- | :----------------------------------------------------------------------------------- |
| **topic**   | Required | `string`                 | Name of the topic: every user subscribed to this topic will receive the notification |
| **message** | Required | `string` or _`ICard`_    | The notification                                                                     |
| mention     | Optional | `boolean`                | Append a mention to the user (@user)                                                 |

```typescript
interface ICard {
  title: string;
  text: string;
}
```

#### Examples

```bash
curl -H "content-type: application/json"\
 -d '{"topic": "banana", "message": "broadcasting to banana subscribers"}'\
 localhost:3978/api/v1/broadcast
```

```bash
curl -H "content-type: application/json"\
 -d '{"topic": "banana", "message": {"text": "this is the text", "title": "this is the title"}}'\
 localhost:3978/api/v1/broadcast
```

```bash
curl -H "content-type: application/json"\
 -d '{"topic": "banana", "message": "hi there", "mention": true}'\
 localhost:3978/api/v1/broadcast
```

***

<a id="configuration">

## Configuration 🏗

### `.env`

A `.env.template` file is provided:

```bash
cp .env.template .env
```

| env var                      | use                                          |
| :--------------------------- | :------------------------------------------- |
| `LOCAL`                      | flag: connect to a running BotApp on Azure   |
| `PORT`                       | listen to a different port on startup        |
| `LOG_LEVEL`                  | logging level (debug, info, warn...)         |
| `MICROSOFT_APP_ID`           | ClientId registered at Azure's ADD (app id)  |
| `MICROSOFT_APP_PASSWORD`     | SecretId registered at Azure's ADD (app key) |

### Topics

As we said, the bot offers the user a menu of topics to subscribe. On broadcast requests (`/api/v1/broadcast`), this service will check who is subscribed to the desired topic.

The available options to subscribe are configurable via `.yaml` file. An example file is provided at the root folder, just change the `value` strings to fit your system.

```bash
cp config.example.yaml config.yaml
```

```yaml
cards:
  [...]
  menuCard:
    title: Available Options
    checkButton:
      title: Check my subscribed notifications 🧾
      value: check
    resetButton:
      title: Reset all my subscribed notifications ❌
      value: reset
    subscriptionButtons:
      - title: Subscribe to banana notifications 🍌
        value: banana
      - title: Subscribe to apple notifications 🍎
        value: apple
      - title: Subscribe to orange notifications 🍊
        value: orange
```

This `.yaml` file would render as:

![default-options](doc/default-options.png)

***

<a id="azure">

## Azure ☁️

This section aims to be a quick summary of which are the minimal needs to have a bot application (Azure App registration) connected to an external web service.

`msteams-private-messages` is, essentially, a server that can receive and send JSON. We'll need to register our service as a "Bot Channel" on Azure.

**Note**: It's possible to host also the service on Azure. There is [official documentation regarding 'how to deploy'](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-deploy-az-cli?view=azure-bot-service-4.0&tabs=javascript). In our case we're hosting the web service in our own platform, keeping the interaction with Azure to the minimum.

We'll need a few resources from the [Azure portal](https://portal.azure.com/#home)

1. **Resource group**.
    - Whatever you want to name it.
2. **Bot Channel Registration**.
    - Bot handle: internal naming. Can't be changed after creation. Won't be displayed when proper naming is set.
    - Messaging endpoint: the web address of the `msteams-private-messages` service. Can be changed after creation. Will look like:
      ```
      https://{domain}/api/v1/messages
      ```
      <img src="doc/azure-create-bot-channel.png" height=600 />
3. Go to the settings of your **Bot Channel Registration**
    - Select "Settings": <img src="doc/azure-bot-management.png" />
    - Copy the **Microsoft App ID** value (the one that can't be changed)
    - Click "Manage", then "Certificate & secrets": <img src="doc/azure-manage-appid.png" height=300 />
    - Create a "New client secret" and copy its value (you won't see it again). This will be our **Microsoft App Secret**
4. Go back to the settings of your **Bot Channel Registration**
    - Select "Channels": <img src="doc/azure-bot-management2.png" width=250 />
    - Connect to Microsoft Teams channel. It should say "Running" <img src="doc/azure-connect-to-channels.png" />

### Remote Connection

We've ended up with 2 values: **Microsoft App Id** & **Microsoft App Secret**.</br>
Copy those values in your `.env` file for enabling remote connection (!LOCAL).

```dotenv
LOCAL=false
MICROSOFT_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_APP_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

***
<a id="local-development">

## Local Development 🖥

### Prerequisites

- Node (>=10.14)
- Bot Framework Emulator (>=4.3.0); you can obtain it from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Start the server

1. Install modules

```bash
npm install
```

2. write `.env` file; you may start using `.env.template`

```bash
cp .env.template .env
```

3. (OPTIONAL) write `config.yaml` file; you may use `config.example.yaml` as reference. </br>
Note: If no `config.yaml` is provided, the service will use `config.example.yaml` by default.

```bash
cp config.example.yaml config.yaml
```

4. Start the server

```bash
npm start
```

### Emulator

5. Connect to the bot endpoint using Bot Framework Emulator
    - Bot URL would be `http://localhost:3978/api/v1/messages`
    - Leave app id and password empty for local development
    <p align="center"><img src="doc/open-bot-emulator.png" alt="open-bot-emulator" width="300" /></p>

![local-bot-emulator](doc/local-bot-emulator.png)
_Bot Emulator connected to local service_

### Debugging on Teams app

**prerequisites**

-  [`ngrok`](https://ngrok.com/) or equivalent tunneling solution
-  [M365 developer account](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/build-and-test/prepare-your-o365-tenant) or access to a Teams account with the appropriate permissions to install an app.

1. `ngrox`: Your app will be run from a localhost server. You will need to setup `ngrok` in order to tunnel from the Teams client to localhost.</br>
Run `ngrok` point to port 3978:

```bash
ngrok http -host-header=rewrite 3978
```

You may test that everything is up requesting server info:

```bash
 $» curl -s https://{subdomain}.ngrok.io/ | jq
"msteams-private-messages@x.y.z"
```

2. TODO

***

<a id="faq">

## FAQ 🙋‍♀️

**Q: Do I really need a whole service & db for just private notifications on MSTeams?**<br/>
**R:** Yes. [You can't send messages to the users but rather continue a prev. conversation they started](https://github.com/microsoft/botframework-sdk/issues/4339). You need to store the reference of every conversation.

**Q: I've tried to mention the user on Bot Framework Emulator and it doesn't work**</br>
**R:** We know. Appending a mention does work on Microsoft Teams but won't render on the Emulator. Probably this is a issue related to the Emulator itself.

**Q: Why the pixeled icon?**</br>
**R:** One of the devs thought it was cool.

***

<a id="doc">

## Additional Doc 📚

- [SO: Sending proactive messages to a channel in Teams](https://stackoverflow.com/questions/60801497/sending-proactive-messages-to-a-channel-in-teams/)
- [SO: Send Proactive Adaptive Card Message to MS Teams Channel](https://stackoverflow.com/questions/61956203/send-proactive-adaptive-card-message-to-ms-teams-channel/)
- [SO: Bot Channels Registration - Azure Bot Framework](https://stackoverflow.com/questions/61183292/bot-channels-registration-azure-bot-framework/)
- [Docs: Bot basics](https://docs.microsoft.com/en-us/microsoftteams/platform/bots/bot-basics?tabs=javascript)
- [Docs: Send proactive notifications to users](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=csharp)
- [Docs: Bot channels registration](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-4.0)
- [Code: microsoft/BotBuilder-Samples](https://github.com/microsoft/BotBuilder-Samples)
